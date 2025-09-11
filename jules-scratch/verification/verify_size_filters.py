from playwright.sync_api import Page, expect

def test_size_filters_are_dynamic(page: Page):
    """
    This test verifies that the size filter on the products page
    displays a variety of sizes, including new ones.
    """
    # 1. Arrange: Go to the products page.
    page.goto("http://localhost:3000/products")

    # 2. Act: Wait for the filter sidebar to be visible.
    # We'll identify the filter group by its title.
    size_filter_group = page.get_by_role("button", name="Size")
    expect(size_filter_group).to_be_visible()

    # 3. Assert: Check that the new sizes are present.
    # We'll check for a few specific sizes that were added.
    expect(page.get_by_label("5.5")).to_be_visible()
    expect(page.get_by_label("13")).to_be_visible()
    expect(page.get_by_label("15")).to_be_visible()

    # 4. Screenshot: Capture the filter section for visual verification.
    filters_sidebar = page.locator("aside.w-full.md\\:w-1\\/4")
    filters_sidebar.screenshot(path="jules-scratch/verification/size-filters.png")
