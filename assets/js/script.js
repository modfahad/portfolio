'use strict';

// element toggle function
const elementToggleFunc = function (elem) {
  // console.log('fahad');
  elem.classList.toggle('active');
};

// sidebar variables
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener('click', function () {
  elementToggleFunc(sidebar);
});

// testimonials variables
const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
const modalContainer = document.querySelector('[data-modal-container]');

// modal variable
const modalImg = document.querySelector('[data-modal-img]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalText = document.querySelector('[data-modal-text]');

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener('click', function () {
    modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
    modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
    modalTitle.innerHTML = this.querySelector(
      '[data-testimonials-title]',
    ).innerHTML;
    modalText.innerHTML = this.querySelector(
      '[data-testimonials-text]',
    ).innerHTML;

    testimonialsModalFunc();
  });
}

// contact form variables
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener('input', function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute('disabled');
    } else {
      formBtn.setAttribute('disabled', '');
    }
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener('click', function () {
    // Remove active class from all navigation links and pages
    navigationLinks.forEach((link) => link.classList.remove('active'));
    pages.forEach((page) => page.classList.remove('active'));

    // Add active class to clicked link and corresponding page
    this.classList.add('active');
    const pageName = this.textContent.toLowerCase().trim();
    const targetPage = Array.from(pages).find(
      (page) => page.dataset.page.toLowerCase() === pageName,
    );
    if (targetPage) {
      targetPage.classList.add('active');
      window.scrollTo(0, 0);
    }
  });
}
