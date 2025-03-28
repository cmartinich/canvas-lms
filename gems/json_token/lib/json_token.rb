# frozen_string_literal: true

#
# Copyright (C) 2011 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

require "json"
require "base64"

# Convenience methods for encoding and decoding a slug of data into base64
# encoded JSON, e.g. to use in a URL
module JSONToken
  def self.encode(data)
    data = walk_json(data, method(:encode_binary_string))
    Base64.encode64(data.to_json).tr("+/", "-_").gsub(/=|\n/, "")
  end

  def self.decode(token)
    json = Base64.decode64(token.tr("-_", "+/").ljust((token.length + 4 - 1) / 4 * 4, "="))
    json = JSON.parse(json, quirks_mode: true)

    walk_json(json, method(:decode_binary_string))
  end

  def self.walk_json(value, method)
    value = method.call(value)
    keys = case value
           when Hash then value.keys
           when Array then 0...value.length
           else; []
           end
    keys.each do |key|
      value[key] = walk_json(value[key], method)
    end
    value
  end

  def self.encode_binary_string(value)
    return value unless value.is_a?(String) && value.encoding == Encoding::ASCII_8BIT

    { "_binary" => Base64.encode64(value) }
  end

  def self.decode_binary_string(value)
    return value unless value.is_a?(Hash) && value.keys == ["_binary"]

    Base64.decode64(value["_binary"])
  end
end
