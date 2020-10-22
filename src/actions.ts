import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory()

export const TextInputActions = {
  updateTextInputValue: actionCreator<string>('ACTIONS_UPDATE_TEXT_INPUT_VALUE'),
  updateSelectedValue: actionCreator<string>('ACTION_UPDATE_SELECTED_VALUE'),
  updateClickCount: actionCreator('ACTION_UPDATE_CLICK_COUNT')
}
