/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFree: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log('New Product', thisProduct);
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
    /* Metoda znajdowania elementów */
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log('Product form: ', thisProduct.form);
      //console.log('Product form inputs: ', thisProduct.formInputs);
    }
    /* Metoda akordeonu */
    initAccordion() {
      const thisProduct = this;
      /* Znajdowanie elementu który ma reagować na kliknięcie */
      /* START: nasłuchiwanie kliknięcia */
      thisProduct.accordionTrigger.addEventListener('click', function () {
        //console.log('Akordeon kliknięty: ', thisProduct.accordionTrigger);
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
    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      /*odczytaj dane z formularza i zapisz w stałej */
      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {};
      /* stwórz zmienną i przypisz domyślną cene produktu */
      let price = thisProduct.data.price;
      //console.log('domyślna cena: ', price);
      /* START PĘTLI: dla każdego parametru (paramId) produktu (thisProduct.data.param) */
      for (let paramId in thisProduct.data.params) {
        /* zapisz element w produkcie (thisProduct.data.params) z kluczem (paramId) jako stałą */
        const param = thisProduct.data.params[paramId];
        /* START PĘTLI: dla każdej opcji (optionId) w opcjach parametrów (param.options) */
        for (let optionId in param.options) {
          /* zapisz element w opcjach parametrów (param.options) z kluczem (optionId) jako stałą */
          const option = param.options[optionId];
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          /* START WARUNEK: jeśli opcja (option) jest zaznaczona I nie jest domyślna */
          if (optionSelected && !option.default) {
            /* dodaj cenę opcji (option) do zmiennej ceny całościowej (price) */
            price += option.price;
            /* KONIEC WARUNKU: jeśli opcja (option) jest zaznaczona I nie jest domyślna */
            /* START WARUNEK: jeśli opcja (option) nie jest zaznaczona I jest domyślna */
          } else if (!optionSelected && option.default) {
            /* odejmij cenę opcji (option) od zmiennej ceny całościowej (price) */
            price -= option.price;
            /* KONIEC WARUNKU: jeśli opcja (option) nie jest zaznaczona I jest domyślna */
          }
          /* WIZUALIZACJA ZAMÓWIENIA NA OBRAZKACH */
          /* stworz stałą (images) i zapisz w niej wszystkie obrazki dostępnych opcji */
          const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          /* START WARUNKU: jeśli opcja jest zaznaczona */
          if (optionSelected) {
            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            /* dla każdego obrazka (image) ze wszystkich obrazków (images) */
            for (let image of images) {
              /* dodaj klase (imageVisible) */
              image.classList.add(classNames.menuProduct.imageVisible);
            }
            /* KONIEC WARUNKU: jeśli opcja jest zaznaczona */
            /* START WARUNKU: jeśli opcja nie jest zaznaczona */
          } else {
            /* dla każdego obrazka (image) ze wszystkich obrazków (images) */
            for (let image of images) {
              /* usuń klase (imageVisible) */
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
            /* KONIEC WARUNKU: jeśli opcja nie jest zaznaczona */
          }
          /* KONIEC PĘTLI: dla każdej opcji (optionId) w opcjacj parametrów (param.options) */
        }
        /* KONIEC PĘTLI: dla każdego parametru (paramId) produktu (thisProduct.data.param) */
      }
      /* wstaw cene (price) w HTML (thisProduct.priceElem) */
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments ', element);
    }

    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('New Cart: ', thisCart);
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
  }


  /* Metody */
  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data: ', thisApp.data);
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
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };
  app.initCart();
  app.init();
}
