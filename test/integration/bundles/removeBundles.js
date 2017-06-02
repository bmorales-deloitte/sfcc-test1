var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var Resource = require('../../mocks/dw/web/Resource');

describe('Remove bundle from product line item', function () {
    this.timeout(50000);
    var cookieJar = request.jar();
    var UUID;
    var bundlePid = 'womens-jewelry-bundle';
    var qty = 1;
    var childPids = '013742002836,013742002805,013742002799';

    var myRequest = {
        url: config.baseUrl + '/Cart-AddProduct',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {
            pid: bundlePid,
            childPids: childPids,
            quantity: qty,
            options: []
        }
    };

    before(function () {
        return request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected Cart-AddProduct bundles statusCode to be 200.');
            var bodyAsJson = JSON.parse(response.body);
            UUID = bodyAsJson.cart.items[0].UUID;
        });
    });

    it('should be able to remove a bundle from product line item', function () {
        var cartEmptyMsg = Resource.msgf('info.cart.empty.msg', 'cart', null);
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + bundlePid + '&uuid=' + UUID;
        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 200, 'Expected removeProductLineItem call statusCode to be 200.');
                var bodyAsJson = JSON.parse(removedItemResponse.body);
                assert.equal(bodyAsJson.resources.emptyCartMsg, cartEmptyMsg, 'actual response from removing bundles not are expected');
                assert.equal(bodyAsJson.resources.numberOfItems, '0 Items', 'should return 0 items in basket');
            });
    });

    it('should return error if UUID does not match', function () {
        var bogusUUID = UUID + '3';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + bundlePid + '&uuid=' + bogusUUID;
        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 500, 'Expected removeProductLineItem request to fail when UUID is incorrect.');
            })
            .catch(function (error) {
                assert.equal(error.statusCode, 500, 'Expected statusCode to be 500 for removing product item with bogus UUID.');

                var bodyAsJson = JSON.parse(error.response.body);

                assert.equal(bodyAsJson.errorMessage,
                    'Unable to remove item from the cart. Please try again! If the issue continues please contact customer service.',
                    'Actual error message from removing  product item with non-matching PID and UUID  not as expected');
            });
    });
    it('should return error if bundle does not exist in Cart', function () {
        var bogusBundleId = 'mens-jewelry-bundle';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + bogusBundleId + '&uuid=' + UUID;
        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 500, 'Expected removeProductLineItem call to fail when UUID is incorrect.');
            })
            .catch(function (error) {
                assert.equal(error.statusCode, 500, 'Expected statusCode to be 500 for removing product item with bogus pid.');

                var bodyAsJson = JSON.parse(error.response.body);

                assert.equal(bodyAsJson.errorMessage,
                    'Unable to remove item from the cart. Please try again! If the issue continues please contact customer service.',
                    'Actual error message from removing  product item with non-matching PID and UUID  not as expected');
            });
    });
});
