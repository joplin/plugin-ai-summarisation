export function craftedReducer(state, action) {
  switch (action.type) {
    case "showCraftedSummary":
      return {
        ...state,
        tempSummary: action.payload,
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
