/**
 * @name Read Markup
 * @author Édipo Costa Rebouças
 */
(function($){
    var readMarkup = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.readMarkup' );
        }    
    };
    var markups =  ['data-markup'];
    var read = {defaults: function( markupName ){return $(this).attr( markupName )}};
    var parse = {defaults: function( value ){return ( new Function( "return [" + value + "]" ))()}};
    var methods = {
/**
 * Lê marcações, converte marcações e dispara eventos
 * @param {Object} options objeto literal de opções
 * @return {Element}
 * @example $('div').readMarkup();
 */        
        init: function(options){
            return this.each(function(){
                var $this = $(this);
                var m = typeof options === 'object' && $.isArray( options.markups ) ? options.markups : markups;
                $.each( m, function( index, markupName ){
                    try{
                        var settings = $.extend( {}, $(this).readMarkup( 'defaults' ), options );
                        if( typeof $this.attr(markupName) == 'undefined' )  throw markupName+" not exist";
                        var original = $this.readMarkup( 'read', markupName );
                        var parsed  = $this.readMarkup( 'parse', original );
                        var values = {parsed : parsed, original : original};
                        $this.trigger(markupName+'.'+settings.triggers.filter, [ values ] );
                        $this.trigger( settings.triggers.filter, [ markupName, values ] );
                        $this.trigger(markupName+'.'+settings.triggers.read, [ values.parsed, values.original ] );
                        $this.trigger( settings.triggers.read, [ markupName, values.parsed, values.original ] );
                    }
                    catch(e){
                        $this.trigger(markupName+'.'+settings.triggers.error, [ e ] );
                        $this.trigger( settings.triggers.error, [ e, markupName ] );
                    } 
                });
            });
        },
/**
 * Lê a marcação de um atributo
 * @param {String} markupName nome da marcação
 * @return {String}
 * @example var values  = $(element).readMarkup( 'read', 'data-rules' );
 */        
        read: function( markupName ){
             if( typeof methods._read[markupName] === 'function' ){
                 return methods._read[markupName].apply( this, arguments );
             }
             return methods._read.defaults.apply( this , arguments );
        },
/**
 * Converte string para array de parâmetros
 * @param {String} value
 * @return {Array}
 * @example var values  = $(element).readMarkup( 'parse', '{ teste: true }, { teste: false }', 'data-rules' );
 * alert( values[0].teste ); //true
 * alert( values[1].teste ); //false
 */        
        parse: function( value, markupName ){
             if( typeof methods._parse[markupName] === 'function' ){
                 return methods._parse[markupName].apply( this, arguments );
             }
             return methods._parse.defaults.apply( this , arguments );
        },
        
/**
 * Adiciona uma marcação de parse
 * @param {String} markupName
 * @example $.readMarkup( 'add', 'data-rules' );
*/        
        add: function( markupName ){
            methods.remove( markupName );
            markups.push( markupName );
            return this;
        },
/**
 * Remove uma marcação de parse
 * @param {String} markupName
 * @example $.readMarkup( 'remove', 'data-markup' );
 */        
        remove: function( markupName ){
            for( var index = 0; index < markups.length; index++ ){
                if( markups[index] == markupName ){
                   markups.splice( index, 1 );
                }
            }
            return this;
        },
/**
 * Retorna configuração padrão
 * @return {Object}
 * @example var defaults = $('div').readMarkup('defaults');
 */        
        defaults: function(){
            return {
                markups : null,
                triggers: {
                    'filter' : 'filter.readMarkup',
                    'read': 'read.readMarkup',
                    'error': 'error.readMarkup'
                }
            }
        }
    }
    
    readMarkup._markups = markups;    
    readMarkup._methods = methods;
    readMarkup._methods._read = read;
    readMarkup._methods._parse = parse;
    /**
     *
     * @namespace $.fn.readMarkup
     */
    $.fn.readMarkup = $.readMarkup  = readMarkup;
    
})(jQuery);