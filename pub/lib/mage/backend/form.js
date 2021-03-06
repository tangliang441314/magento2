/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE_AFL.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    mage
 * @package     mage
 * @copyright   Copyright (c) 2013 X.commerce, Inc. (http://www.magentocommerce.com)
 * @license     http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */
/*jshint jquery:true*/
(function($) {
    "use strict";
    $.widget("mage.form", {
        options: {
            handlersData: {
                save: {},
                saveAndContinueEdit: {
                    action: {
                        args: {back: 'edit'}
                    }
                },
                saveAndNew: {
                    action: {
                        args: {back: 'new'}
                    }
                },
                preview: {
                    target: '_blank'
                }
            }
        },

        /**
         * Form creation
         * @protected
         */
        _create: function() {
            this._bind();
        },

        /**
         * Set form attributes to initial state
         * @protected
         */
        _rollback: function() {
            if (this.oldAttributes) {
                this.element.prop(this.oldAttributes);
            }
        },

        /**
         * Check if field value is changed
         * @protected
         * @param {Object} e event object
         */
        _changesObserver: function(e) {
            var target = $(e.target);
            if (e.type === 'focus' || e.type === 'focusin') {
                this.currentField = {
                    statuses: {
                        checked: target.is(':checked'),
                        selected: target.is(':selected')
                    },
                    val: target.val()
                };

            } else {
                if (this.currentField) {
                    var changed = target.val() !== this.currentField.val ||
                        target.is(':checked') !== this.currentField.statuses.checked ||
                        target.is(':selected') !== this.currentField.statuses.selected;
                    if (changed) {
                        target.trigger('changed');
                    }
                }
            }
        },
        /**
         * Get array with handler names
         * @protected
         * @return {Array} Array of handler names
         */
        _getHandlers: function() {
            var handlers = [];
            $.each(this.options.handlersData, function(key) {
                handlers.push(key);
            });
            return handlers;
        },

        /**
         * Store initial value of form attribute
         * @param {string} attrName name of attribute
         * @protected
         */
        _storeAttribute: function(attrName) {
            this.oldAttributes = this.oldAttributes || {};
            if (!this.oldAttributes[attrName]) {
                var prop = this.element.prop(attrName);
                this.oldAttributes[attrName] = prop ? prop : '';
            }
        },

        /**
         * Bind handlers
         * @protected
         */
        _bind: function() {
            this.element
                .on(this._getHandlers().join(' '), $.proxy(this._submit, this))
                .on('focus blur focusin focusout', $.proxy(this._changesObserver, this));
        },

        /**
         * Get action url for form
         * @param {Object|string} data object with parameters for action url or url string
         * @return {string} action url
         */
        _getActionUrl: function(data) {
            if ($.type(data) === 'object') {
                return this._buildURL(this.oldAttributes.action, data.args);
            } else {
                return $.type(data) === 'string' ? data : this.oldAttributes.action;
            }
        },

        /**
         * Add additional parameters into URL
         * @param {string} url - original url
         * @param {Object} params - object with parameters for action url
         * @return {string} action url
         * @private
         */
        _buildURL: function(url, params) {
            var concat = /\?/.test(url) ? ['&', '='] : ['/', '/'];
            url = url.replace(/[\/&]+$/, '');
            $.each(params, function(key, value) {
                url += concat[0] + key + concat[1] + window.encodeURIComponent(value);
            });
            return url + (concat[0] === '/' ? '/' : '');
        },

        /**
         * Prepare data for form attributes
         * @protected
         * @param {Object}
         * @return {Object}
         */
        _processData: function(data) {
            $.each(data, $.proxy(function(attrName, attrValue) {
                this._storeAttribute(attrName);
                if(attrName === 'action') {
                    data[attrName] = this._getActionUrl(attrValue);
                }
            }, this));
            return data;
        },

        /**
         * Get additional data before form submit
         * @protected
         * @param {string}
         * @param {Object}
         */
        _beforeSubmit: function(handlerName, data) {
            var submitData = {};
            var event = new jQuery.Event('beforeSubmit');
            this.element.trigger(event, [submitData, handlerName]);
            data = $.extend(
                true,
                {},
                this.options.handlersData[handlerName] || {},
                submitData,
                data
            );
            this.element.prop(this._processData(data));
            return !event.isDefaultPrevented();
        },

        /**
         * Submit the form
         * @param {Object} e event object
         * @param {Object} data event data object
         */
        _submit: function(e, data) {
            this._rollback();
            if (false !== this._beforeSubmit(e.type, data)) {
                this.element.trigger('submit', e);
            }
        }
    });
})(jQuery);
