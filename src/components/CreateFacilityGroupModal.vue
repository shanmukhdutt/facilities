<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("New group") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <form @keyup.enter="createFacilityGroup">
      <ion-list>
        <ion-item>
          <ion-label position="floating">
            {{ translate("Name") }} <ion-text color="danger">*</ion-text>
          </ion-label>
          <ion-input @ionBlur="setFacilityGroupId($event)" v-model="formData.facilityGroupName"/>
        </ion-item>
        <ion-item ref="facilityGroupId">
          <ion-label position="floating">
            {{ translate("Internal ID") }}
          </ion-label>
          <ion-input v-model="formData.facilityGroupId" @ionChange="validateFacilityGroupId" @ionBlur="markFacilityGroupIdTouched" />
          <ion-note slot="error">
            {{ translate('Internal ID cannot be more than 20 characters.') }}
          </ion-note>
        </ion-item>
        <ion-item lines="none">
          <ion-label>{{ translate("System group type") }}</ion-label>
          <ion-select :disabled="isFacilityGroupTypeDisabled" interface="popover" v-model="formData.facilityGroupTypeId">
            <ion-select-option :value="facilityGroupType.facilityGroupTypeId" :key="facilityGroupType.facilityGroupTypeId" v-for="facilityGroupType in facilityGroupTypes">
              {{  facilityGroupType.description ?  facilityGroupType.description : facilityGroupType.facilityGroupTypeId }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="floating">
            {{ translate("Description") }}
          </ion-label>
          <ion-input v-model="formData.description"/>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createFacilityGroup" @keyup.enter.stop>
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </form>
  </ion-content>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { addOutline, closeOutline } from "ionicons/icons";
import { translate } from '@hotwax/dxp-components'
import { FacilityService } from "@/services/FacilityService";
import { mapGetters, useStore } from 'vuex'
import { hasError } from "@/adapter";
import { generateInternalId, showToast } from "@/utils";
import logger from "@/logger";

export default defineComponent({
  name: "CreateFacilityGroupModal",
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTitle,
    IonToolbar
  },
  computed: {
    ...mapGetters({
      groups: 'facility/getFacilityGroups',
      facilityGroupTypes: 'util/getFacilityGroupTypes',
    })
  },
  data() {
    return {
      formData: {
        facilityGroupId: '',
        facilityGroupName: '',
        facilityGroupTypeId: '',
        description: '',
      },
      isFacilityGroupTypeDisabled: false,
    }
  },
  props: ['selectedFacilityGroupTypeId'],
  mounted() {
    if(this.selectedFacilityGroupTypeId) {
      this.formData.facilityGroupTypeId = this.selectedFacilityGroupTypeId
      this.isFacilityGroupTypeDisabled = true
    }
  },
  methods: {
    setFacilityGroupId(event: any) {
      this.formData.facilityGroupId = generateInternalId(event.target.value)
    },
    closeModal() {
      modalController.dismiss();
    },
    async createFacilityGroup() {
      if (!this.formData.facilityGroupName?.trim()) {
        showToast(translate('Please fill all the required fields'))
        return;
      }

      if (this.formData.facilityGroupId.length > 20) {
        showToast(translate('Internal ID cannot be more than 20 characters.'))
        return
      }

      // In case the user does not lose focus from the facility name input
      // and click on create the button, we need to set the internal id manually
      if (!this.formData.facilityGroupId) {
        this.formData.facilityGroupId = generateInternalId(this.formData.facilityGroupName)
      }

      try {
        const payload = {
          ...this.formData,
        }

        const resp = await FacilityService.createFacilityGroup(payload);
        if (!hasError(resp)) {
          showToast(translate("Facility group created."))
          const createdGroup = {
            ...this.formData,
            facilityGroupId: resp.data.facilityGroupId,
            facilityCount: 0
          }
          const updatedFacilityGroups = [...this.groups, createdGroup]
          await this.store.dispatch('facility/updateFacilityGroups', updatedFacilityGroups)
          await this.store.dispatch('util/fetchFacilityGroupTypes')
        } else {
          throw resp.data;
        }
      } catch (error) {
        logger.error(error)
        showToast(translate('Failed to create facility group.'))
      }
      modalController.dismiss()
    },
    validateFacilityGroupId(event: any) {
      const value = event.target.value;
      (this as any).$refs.facilityGroupId.$el.classList.remove('ion-valid');
      (this as any).$refs.facilityGroupId.$el.classList.remove('ion-invalid');

      if (value === '') return;

      this.formData.facilityGroupId.length <= 20
        ? (this as any).$refs.facilityGroupId.$el.classList.add('ion-valid')
        : (this as any).$refs.facilityGroupId.$el.classList.add('ion-invalid');
    },
    markFacilityGroupIdTouched() {
      (this as any).$refs.facilityGroupId.$el.classList.add('ion-touched');
    },
  },
  setup() {
    const store = useStore();

    return {
      addOutline,
      closeOutline,
      store,
      translate
    };
  },
});
</script>