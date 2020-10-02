import { Select } from 'antd'
import React from 'react'

const { Option } = Select

export const CustomSelect = (props) => {
  return (
    <Select
      defaultValue='Marker'
      style={{
        margin: '0.5rem',
        position: 'absolute',
        zIndex: 1
      }}
      onChange={(value) => props.setMapType(value)}
    >
      <Option value='Marker'>Marker</Option>
      <Option value='Circle'>Circle</Option>
    </Select>
  )
}
