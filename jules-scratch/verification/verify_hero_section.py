from playwright.sync_api import sync_playwright, Page, expect

def verify_hero_section(page: Page):
    """
    This test verifies that the hero section loads correctly with the
    background video, text, and a canvas for the 3D model.
    """
    # 1. Arrange: Go to the application's homepage.
    # The dev server runs on port 3000.
    page.goto("http://localhost:3000")

    # 2. Assert: Wait for the main heading to be visible.
    # This confirms the page and the hero section have loaded.
    heading = page.get_by_role("heading", name="Unleash Your Speed")
    expect(heading).to_be_visible(timeout=10000) # Increased timeout for video/model loading

    # 3. Assert: Check for the canvas element where the 3D model should be.
    canvas = page.locator("canvas")
    expect(canvas).to_be_visible()

    # 4. Screenshot: Capture the entire viewport for visual verification.
    screenshot_path = "jules-scratch/verification/hero-section-verification.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Set a desktop-like viewport to ensure the 3D model is visible
        page.set_viewport_size({"width": 1920, "height": 1080})
        try:
            verify_hero_section(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()
