import React from 'react'

interface OwnProps {
  inputValue: string
  selectedValue: string
  clickCount: number
}

type Props = OwnProps
export const ShowState: React.FC<Props> = props => {
  return (
    <div>
      <label>[states]</label>
      <div>{props.inputValue}</div>
      <div>{props.selectedValue}</div>
      <div>{props.clickCount}</div>
    </div>
  )
}
