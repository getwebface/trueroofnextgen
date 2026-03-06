import time
from playwright.sync_api import sync_playwright

def verify_process_steps():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with a larger viewport
        context = browser.new_context(viewport={"width": 1280, "height": 1024})
        page = context.new_page()

        try:
            # 1. Start dev server and wait for it to be ready
            page.goto("http://localhost:3000", timeout=60000)

            # Wait for hydration
            time.sleep(2)

            # Scroll to process section
            process_section = page.locator("#process")
            process_section.scroll_into_view_if_needed()

            # Take a screenshot of the process section
            process_section.screenshot(path="process_steps_verification.png")
            print("Successfully took screenshot of the process steps section.")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="process_steps_error.png")
            print("Saved error screenshot.")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_process_steps()