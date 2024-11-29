export function setUserPrice(dispatch: React.Dispatch<any>, price: number) {
    dispatch({ type: "SET_USER_PRICE", payload: price });
}

export const sellIce = (dispatch: any, n: number) => {
    dispatch({
        type: 'SELL_ICE',
        payload: n,
    });
};