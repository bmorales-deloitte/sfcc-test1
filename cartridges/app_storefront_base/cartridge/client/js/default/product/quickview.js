'use strict';
var base = require('./base');

/**
 * Generates the modal window on the first call.
 *
 */
function getModalHtmlElement() {
    if ($('#quickViewModal').length !== 0) {
        $('#quickViewModal').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal fade" id="quickViewModal" role="dialog">'
        + '<div class="modal-dialog quick-view-dialog">'
        + '<!-- Modal content-->'
        + '<div class="modal-content container">'
        + '<div class="modal-header row">'
        + '    <a class="full-pdp-link" href="">View Full Details</a>'
        + '    <button type="button" class="close pull-right" data-dismiss="modal">'
        + '        <span>Close</span>&times;'
        + '    </button>'
        + '</div>'
        + '<div class="modal-body row"></div>'
        + '<div class="modal-footer row"></div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
}

/**
 * @typedef {Object} QuickViewHtml
 * @property {string} body - Main Quick View body
 * @property {string} footer - Quick View footer content
 */

/**
 * Parse HTML code in Ajax response
 *
 * @param {string} html - Rendered HTML from quickview template
 * @return {QuickViewHtml} - QuickView content components
 */
function parseHtml(html) {
    var $html = $(html);
    var body = $html[2].outerHTML;
    var footer = $html[4].innerHTML;

    return { body: body, footer: footer };
}

/**
 * replaces the content in the modal window on for the selected product variation.
 * @param {string} productUrl - url to be used for going to the product details page
 * @param {string} selectedValueUrl - url to be used to retrieve a new product model
 */
function fillModalElement(productUrl, selectedValueUrl) {
    $('.modal-body').spinner().start();
    $.ajax({
        url: selectedValueUrl,
        method: 'GET',
        dataType: 'html',
        success: function (html) {
            var parsedHtml = parseHtml(html);

            $('.modal-body').empty();
            // $('.modal-body').html(html);
            $('.modal-body').html(parsedHtml.body);
            $('.modal-footer').html(parsedHtml.footer);
            $('#quickViewModal .full-pdp-link').attr('href', productUrl);
            $('#quickViewModal .size-chart').attr('href', productUrl);
            $('#quickViewModal').modal('show');
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

module.exports = {
    showQuickview: function () {
        $('body').on('click', '.quickview', function (e) {
            e.preventDefault();
            var selectedValueUrl = $(this).closest('a.quickview').attr('href');
            var productUrl = selectedValueUrl.replace('Product-ShowQuickView', 'Product-Show');
            $(e.target).trigger('quickview:show');
            getModalHtmlElement();
            fillModalElement(productUrl, selectedValueUrl);
        });
    },
    colorAttribute: base.colorAttribute,
    selectAttribute: base.selectAttribute,
    selectOption: base.selectOption,
    availability: base.availability,
    addToCart: base.addToCart,
    showSpinner: function () {
        $('body').on('product:beforeAddToCart', function (e, data) {
            $(data).closest('.modal-content').spinner().start();
        });
    },
    hideDialog: function () {
        $('body').on('product:afterAddToCart', function () {
            $('#quickViewModal').modal('hide');
        });
    },
    beforeUpdateAttribute: function () {
        $('body').on('product:beforeAttributeSelect', function () {
            $('.modal.show .modal-content').spinner().start();
        });
    },
    updateAttribute: function () {
        $('body').on('product:afterAttributeSelect', function (e, response) {
            if ($('.modal.show .product-quickview>.bundle-items').length) {
                $('.modal.show').find(response.container).data('pid', response.data.product.id);
                $('.modal.show').find(response.container)
                    .find('.product-id').text(response.data.product.id);
            } else if ($('.set-items').length) {
                response.container.find('.product-id').text(response.data.product.id);
            } else {
                $('.modal.show .product-quickview').data('pid', response.data.product.id);
                $('.modal.show .full-pdp-link')
                    .attr('href', response.data.product.selectedProductUrl);
            }
        });
    },
    updateAddToCart: function () {
        $('body').on('product:updateAddToCart', function (e, response) {
            // update local add to cart (for sets)
            $('button.add-to-cart', response.$productContainer).attr('disabled',
                (!response.product.readyToOrder || !response.product.available));

            // update global add to cart (single products, bundles)

            var dialog = $(response.$productContainer)
                .closest('.quick-view-dialog');

            $('.add-to-cart-global', dialog).attr('disabled',
                !$('.global-availability', dialog).data('ready-to-order')
                || !$('.global-availability', dialog).data('available')
            );
        });
    },
    updateAvailability: function () {
        $('body').on('product:updateAvailability', function (e, response) {
            // bundle individual products
            $('.product-availability', response.$productContainer)
                .data('ready-to-order', response.product.readyToOrder)
                .data('available', response.product.available)
                .find('.availability-msg')
                .empty()
                .html(response.message);


            var dialog = $(response.$productContainer)
                .closest('.quick-view-dialog');

            if ($('.product-availability', dialog).length) {
                // bundle all products
                var allAvailable = $('.product-availability', dialog).toArray()
                    .every(function (item) { return $(item).data('available'); });

                var allReady = $('.product-availability', dialog).toArray()
                    .every(function (item) { return $(item).data('ready-to-order'); });

                $('.global-availability', dialog)
                    .data('ready-to-order', allReady)
                    .data('available', allAvailable);

                $('.global-availability .availability-msg', dialog).empty()
                    .html(allReady ? response.message : response.resources.info_selectforstock);
            } else {
                // single product
                $('.global-availability', dialog)
                    .data('ready-to-order', response.product.readyToOrder)
                    .data('available', response.product.available)
                    .find('.availability-msg')
                    .empty()
                    .html(response.message);
            }
        });
    }
};
