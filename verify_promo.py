import os
import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to a location page to check if promo text is there
        page.goto('http://localhost:8788/locations/melbourne')

        time.sleep(3) # Wait for page load

        # Scroll down to ensure it's in view
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)

        # Take screenshot
        os.makedirs('/home/jules/verification', exist_ok=True)
        screenshot_path = '/home/jules/verification/verification_melbourne.png'
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == '__main__':
    verify()
