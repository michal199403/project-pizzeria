/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  /* Klasy */
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      /* Zapisanie właściwości instancji */
      thisProduct.id = id;
      thisProduct.data = data;
      /* Wywoływanie metod */
      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      console.log('New Product', thisProduct);
    }
    /* Metoda renderowania produktów WEWNĄTRZ KLASY */
    renderInMenu() {
      const thisProduct = this;
      /* Wygenerowanie HTML na podstawie szablonu */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* Tworzenie elementu DOM za pomocą kodu produktu 'utils.createElementFromHTML' */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* Znajdowanie kontenera z menu */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* Dodawanie elementu do menu */
      menuContainer.appendChild(thisProduct.element);
    }
    /* Metoda akordeonu */
    initAccordion() {
      const thisProduct = this;
      /* Znajdowanie elementu który ma reagować na kliknięcie */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: nasłuchiwanie kliknięcia */
      clickableTrigger.addEventListener('click', function () {
        console.log('Akordeon kliknięty: ', clickableTrigger);
        /* Zapobieganie podstawowej akcji */
        event.preventDefault();
        /* Wyświetlanie aktywnej klasy na elemencie 'thisProduct' */
        thisProduct.element.classList.toggle('active');
        /* Znajdowanie wszystkich aktywnych 'product' */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* START PĘTLI: dla każdego aktywnego 'productl */
        for (let activeProduct of activeProducts) {
          /* START:  jeśli aktywny produkt nie jest elementem 'thisProduct' */
          if (activeProduct != thisProduct.element) {
            /* Usuń klase 'active' dla aktywnego 'product' */
            activeProduct.classList.remove('active');
            /* KONIEC: jeśli aktywny produkt nie jest elementem 'thisProduct' */
          }
          /* KONIEC: PĘTLI: dla każdego aktywnego 'product' */
        }
        /* KONIEC: nasłuchiwanie kliknięcia */
      });
    }
  }

  /* Metody */
  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
