import React from 'react'

interface OwnProps {
  title: string
  onClick: Function
}
type Props = OwnProps
export const SubmitButton: React.FC<Props> = props => {
  return (
    <div>
      <button onClick={() => props.onClick()}>{props.title}</button>
    </div>
  )
}
