# frozen_string_literal: true

#
# Copyright (C) 2012 - present Instructure, Inc.
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

require "spec_helper"

describe "BookmarkedCollection::Collection" do
  before do
    @bookmark = double("bookmark")
    @bookmarker = double("bookmarker", validate: true, bookmark_for: @bookmark)
    @collection = BookmarkedCollection::Collection.new(@bookmarker)
  end

  describe "bookmark accessors" do
    it "supports current_bookmark" do
      value = 5
      expect(@collection.current_bookmark).to be_nil
      @collection.current_bookmark = value
      expect(@collection.current_bookmark).to eq(value)
    end

    it "supports next_bookmark" do
      value = 5
      expect(@collection.next_bookmark).to be_nil
      @collection.next_bookmark = value
      expect(@collection.next_bookmark).to eq(value)
    end

    it "supports include_bookmark" do
      value = true
      expect(@collection.include_bookmark).to be_nil
      @collection.include_bookmark = value
      expect(@collection.include_bookmark).to eq(value)
    end
  end

  describe "#current_page" do
    it "is first_page if current_bookmark is nil" do
      @collection.current_bookmark = nil
      expect(@collection.current_page).to eq(@collection.first_page)
    end

    it "leads with a 'bookmark:' prefix otherwise" do
      @collection.current_bookmark = "some value"
      expect(@collection.current_page).to match(/^bookmark:/)
    end

    it "changes with current_bookmark" do
      @collection.current_bookmark = "bookmark1"
      page1 = @collection.current_page
      expect(page1).not_to be_nil

      @collection.current_bookmark = "bookmark2"
      page2 = @collection.current_page
      expect(page2).not_to be_nil
      expect(page2).not_to eq(page1)

      @collection.current_bookmark = nil
      expect(@collection.current_page).to eq(@collection.first_page)
    end
  end

  describe "#next_page" do
    it "is nil if next_bookmark is nil" do
      @collection.next_bookmark = nil
      expect(@collection.next_page).to be_nil
    end

    it "leads with a 'bookmark:' prefix otherwise" do
      @collection.next_bookmark = "some value"
      expect(@collection.next_page).to match(/^bookmark:/)
    end

    it "changes with next_bookmark" do
      @collection.next_bookmark = "bookmark1"
      page1 = @collection.next_page
      expect(page1).not_to be_nil

      @collection.next_bookmark = "bookmark2"
      page2 = @collection.next_page
      expect(page2).not_to be_nil
      expect(page2).not_to eq(page1)

      @collection.next_bookmark = nil
      expect(@collection.next_page).to be_nil
    end
  end

  describe "round-tripping dates" do
    it "converts to UTC" do
      timestamp = Time.parse("2020-12-31T22:00:00-09:00").in_time_zone("Alaska")
      page = @collection.bookmark_to_page([1, timestamp])
      expect(page).to match(/^bookmark:/)
      bookmark = @collection.page_to_bookmark(page)
      expect(bookmark).to eq([1, "2021-01-01T07:00:00.000000Z"])
    end

    it "preserves fractional times" do
      timestamp = Time.parse("2020-02-22T22:22:22.22Z").utc
      page = @collection.bookmark_to_page([1, [2, timestamp]])
      expect(page).to match(/^bookmark:/)
      bookmark = @collection.page_to_bookmark(page)
      expect(bookmark).to eq([1, [2, "2020-02-22T22:22:22.220000Z"]])
    end
  end

  describe "#current_page=" do
    it "sets current_bookmark to nil if nil" do
      @collection.current_bookmark = "some value"
      @collection.current_page = nil
      expect(@collection.current_bookmark).to be_nil
    end

    it "goes to nil if missing 'bookmark:' prefix" do
      @collection.current_page = "invalid bookmark"
      expect(@collection.current_bookmark).to be_nil
    end

    it "goes to nil if can't deserialize bookmark" do
      # "W1td" is the base64 encoding of "[[]", which should fail to parse as JSON
      @collection.current_page = "bookmark:W1td"
      expect(@collection.current_bookmark).to be_nil
    end

    it "preserves bookmark value through serialization" do
      bookmark = "bookmark value"
      @collection.current_bookmark = bookmark
      page = @collection.current_page
      @collection.current_bookmark = nil

      @collection.current_page = page
      expect(@collection.current_bookmark).to eq(bookmark)
    end
  end

  describe "#first_page" do
    it "is not nil" do
      expect(@collection.first_page).not_to be_nil
    end

    it "sets bookmark to nil when used to set page" do
      @collection.current_bookmark = "some value"
      @collection.current_page = @collection.first_page
      expect(@collection.current_bookmark).to be_nil
    end
  end

  describe "#has_more!" do
    before do
      @item = double("item")
      @collection << @item
      @bookmark = double("bookmark")
    end

    it "uses the bookmarker on the last item" do
      expect(@bookmarker).to receive(:bookmark_for).once.with(@item).and_return(@bookmark)
      @collection.has_more!
      expect(@collection.next_bookmark).to eq(@bookmark)
    end
  end

  describe "last_page" do
    it "assumes the current_page is the last_page if there's no next_page" do
      @collection.current_bookmark = "bookmark1"
      @collection.next_bookmark = nil
      expect(@collection.last_page).to eq(@collection.current_page)
    end

    it "assumes the last_page is unknown if there's a next_page" do
      @collection.current_bookmark = "bookmark1"
      @collection.next_bookmark = "bookmark2"
      expect(@collection.last_page).to be_nil
    end
  end

  describe "remaining will_paginate support" do
    it "supports per_page" do
      value = 5
      expect(@collection.per_page).to eq(Folio.per_page)
      @collection.per_page = value
      expect(@collection.per_page).to eq(value)
    end

    it "supports total_entries" do
      value = 5
      expect(@collection.total_entries).to be_nil
      @collection.total_entries = value
      expect(@collection.total_entries).to eq(value)
    end

    it "supports reading empty previous_page" do
      expect(@collection.previous_page).to be_nil
    end

    it "supports reading empty total_pages" do
      expect(@collection.total_pages).to be_nil
    end
  end
end
