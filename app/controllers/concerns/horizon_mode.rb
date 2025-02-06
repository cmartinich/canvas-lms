# frozen_string_literal: true

#
# Copyright (C) 2021 - present Instructure, Inc.
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

module HorizonMode
  # Use this function after @context is set
  def redirect_student_to_horizon
    return unless @context.is_a?(Course) && @context.horizon_course?

    return if @context.user_is_admin?(@current_user)

    redirect_to_horizon
  end

  def redirect_to_horizon
    horizon_redirect_url = DynamicSettings.find("horizon")["redirect_url"]
    canvas_url = request.path
    redirect_to "#{horizon_redirect_url}?reauthenticate=false&canvas_url=#{canvas_url}"
  end
end
