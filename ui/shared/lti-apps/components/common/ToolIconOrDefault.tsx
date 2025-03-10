/*
 * Copyright (C) 2025 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

type ToolIconUrlOrDefaultProps = {
  iconUrl: string | null | undefined
  toolId: number | string
  toolName: string
  size: number | string
  // I don't know why, but the AssetProcessors usage
  // requires margin to not have the border clippped,
  // But the Apps page usage isn't treating margin="0 12 0 0"
  // the same as marginRight=12
  margin?: string | number,
  marginRight?: string | number
}

export const ToolIconOrDefault = (
  {iconUrl, toolId, toolName, size, margin, marginRight}: ToolIconUrlOrDefaultProps
) => {
  if (iconUrl) {
    return (
      <img
        alt={toolName}
        style={{
          height: size,
          width: size,
          margin,
          marginRight,
          borderRadius: '4.5px',
          border: '0.75px solid #C7CDD1',
        }}
        src={iconUrl}
        onError={e => { (e.target as HTMLImageElement).src = `/lti/tool_default_icon?id=${toolId}&name=${toolName}`}}
      />
    )
  } else {
    return (
      <img
        alt={toolName}
        style={{height: size, width: size, margin, marginRight}}
        src={`/lti/tool_default_icon?id=${toolId}&name=${toolName}`}
      />
    )
  }
}
