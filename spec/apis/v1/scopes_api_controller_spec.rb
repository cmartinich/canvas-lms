# frozen_string_literal: true

#
# Copyright (C) 2018 - present Instructure, Inc.
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

require_relative "../api_spec_helper"

describe ScopesApiController, type: :request do
  before do
    # We want to force the usage of the fallback scope mapper here, not the generated version
    stub_const("ApiScopeMapper", ApiScopeMapperFallback)

    enable_default_developer_key!
  end

  describe "index" do
    before do
      allow_any_instance_of(Account).to receive(:feature_enabled?).and_return(false)
    end

    let(:account) { account_model }
    let(:api_url) { "/api/v1/accounts/#{account.id}/scopes" }

    let(:scope_params) do
      {
        controller: "scopes_api",
        action: "index",
        format: "json",
        account_id: account.id.to_s
      }
    end

    context "with admin" do
      before do
        account_admin_user(account:)
        user_with_pseudonym(user: @admin)
      end

      it "returns expected scopes" do
        json = api_call(:get, "/api/v1/accounts/#{@account.id}/scopes", scope_params)
        expect(json).to include({
                                  "resource" => "oauth2",
                                  "verb" => "GET",
                                  "scope" => "/auth/userinfo",
                                  "resource_name" => "oauth2"
                                })
      end

      it "groups scopes when group_by is passed in" do
        scope_params[:group_by] = "resource_name"

        json = api_call(:get, "/api/v1/accounts/#{@account.id}/scopes", scope_params)
        expect(json["oauth2"]).to eq [{
          "resource" => "oauth2",
          "verb" => "GET",
          "scope" => "/auth/userinfo",
          "resource_name" => "oauth2"
        }]
      end

      it "returns expected scopes as an admin" do
        account_admin_user(account: Account.site_admin)
        DeveloperKey.default.developer_key_account_bindings.first.update!(workflow_state: "on")
        json = api_call(
          :get,
          "/api/v1/accounts/#{Account.site_admin.id}/scopes",
          scope_params.merge(account_id: Account.site_admin.id)
        )

        expect(json).to include({
                                  "resource" => "oauth2",
                                  "verb" => "GET",
                                  "scope" => "/auth/userinfo",
                                  "resource_name" => "oauth2"
                                })
      end
    end

    context "with nonadmin" do
      before do
        user_with_pseudonym(account:)
      end

      it "returns a 403" do
        api_call(:get, api_url, scope_params)
        expect(response).to have_http_status :forbidden
      end
    end
  end
end
