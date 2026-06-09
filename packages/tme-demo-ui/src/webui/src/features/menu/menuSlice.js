import { createSlice } from '@reduxjs/toolkit';

// === Selectors ==============================================================

export const getOpenTopology = state => state.menu.openTopology;
export const getOpenService = state => state.menu.openService;

export const getOpenTopologyName = state =>
  getOpenTopology(state) && getOpenTopology(state).match(/{([^}]+)}$/)[1];

export const getOpenServiceName = state =>
  getOpenService(state) && getOpenService(state).match(/{([^}]+)}$/)[1];


// === Reducer ================================================================

const menuSlice = createSlice({
  name: 'menu',
  initialState: {},
  reducers: {
    topologyToggled: (state, { payload }) => {
      state.openTopology = state.openTopology === payload ? undefined : payload;
    },

    serviceToggled: (state, { payload }) => {
      state.openService = state.openService === payload ? undefined : payload;
    },
  }
});

const { actions, reducer } = menuSlice;
export const { topologyToggled, serviceToggled } = actions;
export default reducer;
