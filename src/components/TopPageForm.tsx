import React from 'react'
import { TextInput } from './TextInput';
import { TopPageHandler } from '../containers/TopPageContainer';
import { RadioInput } from './RadioInput';
import { ShowState } from './ShowState';
import { SubmitButton } from './SubmitButton';

interface OwnProps {
  inputValue: string
  selectedValue: string
  clickCount: number

}
type Props = OwnProps & TopPageHandler
export class TopPageForm extends React.Component<Props> {
  render() {
    return (
      <React.Fragment>
        <TextInput title='入力' inputValue={this.props.inputValue} onChangeValue={this.props.handleOnChangeValue} />
        <RadioInput title='ラジオ' selectedValue={this.props.selectedValue} onChangeValue={this.props.handleOnSelectValue} />
        <SubmitButton title='Click me' onClick={this.props.handleOnClick} />
        <ShowState inputValue={this.props.inputValue} selectedValue={this.props.selectedValue} clickCount={this.props.clickCount} />

      </React.Fragment>
    )
  }
}
