import { reducerWithInitialState } from '../node_modules/typescript-fsa-reducers';
import { TextInputActions } from './actions';

export interface State {
  inputValue: string
  selectedValue: string
  clickCount: number
}

export const initialState: State = {
  inputValue: '',
  selectedValue: '',
  clickCount: 0
}

export const Reducer = reducerWithInitialState(initialState)
  .case(TextInputActions.updateTextInputValue, (state, inputValue) => {
    return { ...state, inputValue }
  })
  .case(TextInputActions.updateSelectedValue, (state, selectedValue) => {
    return { ...state, selectedValue }
  })
  .case(TextInputActions.updateClickCount, (state) => {
    return { ...state, clickCount: state.clickCount + 1 }
  })
