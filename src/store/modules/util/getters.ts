import { GetterTree } from 'vuex'
import UtilState from './UtilState'
import RootState from '@/store/RootState'

const getters: GetterTree<UtilState, RootState> = {
  getProductStores(state) {
    return state.productStores;
  },
  getFacilityTypes(state) {
    return state.facilityTypes
  },
  getLocationTypes(state) {
    return state.locationTypes
  },
  getProductStore: (state) => (productStoreId: string) => {
    return state.productStores.find((store: any) => store.productStoreId === productStoreId)
  },
  getCountries(state) {
    return state.countries
  },
  getStates(state) {
    return state.states
  }
}
export default getters;