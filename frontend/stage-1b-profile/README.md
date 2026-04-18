# Profile Card – Stage 1b

## 📌 Overview

This project is a responsive and accessible Profile Card built with plain HTML, CSS, and JavaScript as part of the HNG Frontend Internship (Stage 1b).

The goal was to create a simple but well-structured component that is fully testable, semantically correct, and accessible.

---

## 🚀 Live Demo

👉 https://hng-stage-1b-profile.vercel.app/

---

## 📂 Repository

👉 https://github.com/yusuuf-mm/hng-internship-workspace/frontend

---

## 🎯 Features

* Displays user profile information:

  * Name
  * Biography
  * Avatar image
  * Social links
  * Hobbies
  * Dislikes
* Shows current time in milliseconds using `Date.now()`
* Updates time dynamically every second
* Fully responsive layout (mobile, tablet, desktop)
* All elements include required `data-testid` attributes for automated testing

---

## 🧱 Structure & Semantics

The card uses proper semantic HTML:

* `<article>` → root container
* `<header>` → name
* `<figure>` → avatar image
* `<nav>` → social links
* `<section>` → hobbies & dislikes
* `<ul>/<li>` → lists

This ensures better accessibility and maintainability.

---

## ♿ Accessibility

* Avatar includes meaningful `alt` text
* Links are keyboard accessible
* Focus styles are visible
* Time updates use `aria-live="polite"`
* Proper semantic structure improves screen reader support

---

## 📱 Responsiveness

* Mobile-first layout
* Stacked layout on small screens
* Grid layout on larger screens
* Handles long content without breaking layout

---

## 🧪 Testing Compliance

All required `data-testid` attributes are implemented:

* `test-profile-card`
* `test-user-name`
* `test-user-bio`
* `test-user-time`
* `test-user-avatar`
* `test-user-social-links`
* `test-user-hobbies`
* `test-user-dislikes`

---

## ⚠️ Known Limitations

* Static profile data (no backend or persistence)
* No image upload (uses placeholder/avatar URL)
* Minimal styling (focused on functionality and testability)

---

## 🛠 Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript

---

## 📌 Notes

This implementation focuses on:

* Simplicity
* Accessibility
* Testability
* Clean structure

---

## 🙌 Acknowledgment

Built as part of the HNG Internship Frontend track (Stage 1b).
