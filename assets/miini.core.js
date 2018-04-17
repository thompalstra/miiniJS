let doc = document;

document.addEventListener( 'DOMContentLoaded', function( event ) {
  this.dispatchEvent( new CustomEvent( 'ready', {
    cancelable: true,
    bubbles: true
  } ) );
} )

let extend = function(){
  return {
    args: arguments,
    with: function( obj, forceProperty ){
      for( var i in this.args ){
        var target = ( typeof this.args[i].prototype !== 'undefined' && forceProperty !== true ) ? this.args[i].prototype : this.args[i];
        for( var i in obj ){
          target[i] = obj[i];
        }
      }
    }
  };
}

let serialize = function( obj, prefix ){
  var items = [];
  for( var i in obj ){
    if( typeof obj[i] == 'object' ){
      items.push( serialize( obj[i], i ) );
    } else {
      if( prefix ){
        key = "[" + prefix + "]" + i;
      } else {
        key = i;
      }

      items.push( key + "=" + obj[i] );
    }
  }
  return items.join('&');
}
let deserialize = function( str ){
  var data = {};
  location.search.substring( 1, location.search.length ).split('&').forEach( ( p ) => {
    var parts = p.split('=');

    data[ parts[0] ] = parts[1];
  } );
  return data;
}

let mii = function(){

}

extend( mii ).with({
  defaults: {
    xhr: {
      method: 'GET',
      responseType: '',
      onsuccess: function(){},
      onerror: function(){},
      data: {}
    },
    template:{
      tags: [ "<%", "%>" ]
    }
  },
  validateXhrObject: function( obj ){

    if( typeof obj === 'string' ){
      obj = {
        url: obj
      };
    }

    if( !obj.hasOwnProperty( 'url' ) ){
      obj.url = location.href;
    }
    if( !obj.hasOwnProperty( 'method' ) ){
      obj.method = mii.defaults.xhr.method;
    }

    if( !obj.hasOwnProperty( 'onsuccess' ) ){
      obj.onsuccess = mii.defaults.xhr.onsuccess;
    }
    if( !obj.hasOwnProperty( 'onerror' ) ){
      obj.onerror = mii.defaults.xhr.onerror;
    }
    if( !obj.hasOwnProperty( 'data' ) ){
      obj.data = mii.defaults.xhr.data;
    }
    if( !obj.hasOwnProperty( 'responseType' ) ){
      obj.responseType = mii.defaults.xhr.responseType;
    }

    return obj;
  }
}, true)

extend( Document ).with( {
  create: function( a, b ){
    if( typeof a == 'string' && a.length > 0 ){
      if( a[0] == '<' ){
        var div = document.createElement( 'div' );
        div.innerHTML = a;
        if( div.children > 1 ){
          return div.childNodes;
        } else {
          return div.childNodes[0];
        }

      } else {
        var html = document.createElement( a );

        if( typeof b == 'object' ){
          for( var i in b ){
            if( typeof html[i] !== 'undefined' ){
              html[i] = b[i];
            } else {
              html.setAttribute( i, b[i] );
            }
          }
        }
      }
    }
    return html;
  }
} )

extend( HTMLElement, Document ).with({
  find: function( q ){
    return this.querySelectorAll( q );
  },
  one: function( q ){
    return this.querySelector( q );
  },
  findById: function( q ){
    return this.getElementById( q );
  },
  findbyClass: function( q ){
    return this.getElementsByClassName( q );
  },
  findByTag: function( q ){
    return this.getElementsByTagName( q );
  },
  on: function( eventTypes, a, b, c ){
    eventTypes.split( ' ' ).forEach( ( eventType ) => {
      if( typeof a === 'function' ){
        this.addEventListener( eventType, a, b );
      } else if( typeof b === 'function' ){
        this.addEventListener( eventType, function( originalEvent ) {
          if( !originalEvent.defaultPrevented ){
            if( event.target.matches( a ) ){
              b.call( event.target, originalEvent );
            } else if( c !== false && ( closest = event.target.closest( a ) ) ){
              b.call( closest, originalEvent );
            }
          }
        } );
      }
    }  )
  },
  do: function( eventType ){
    if( typeof options == 'undefined' ){
      options = {
        cancelable: true,
        bubbles: true
      };
    }
    var event = new CustomEvent( eventType, options );
    this.dispatchEvent( event );
    return event;
  },
  data: function( key, value ){
    if( typeof key === 'string' ){
      if( typeof value === 'undefined' ){
        return this.dataset[ key ];
      } else if( value == null ){
        delete this.dataset[key];
      } else {
        this.dataset[key] = value;
      }
    } else if( typeof key === 'object' ){
      for( var i in key ){
        if( key[i] == null ){
          delete this.dataset[key];
        } else {
          this.dataset[i] = key[i];
        }
      }
    }
  },
  attr: function( key, value ){
    if( typeof key === 'string' ){
      if( typeof value === 'undefined' ){
        return this.getAttribute( key );
      } else if( value == null ){
        this.removeAttribute( key );
      } else {
        this.setAttribute( key, value );
      }
    } else if( typeof key === 'object' ){
      for( var i in key ){
        if( key[i] == null ){
          this.removeAttribute( i );
        } else {
          this.setAttribute( i, key[i] );
        }
      }
    }
  },
  css: function( key, value ){
    if( typeof key === 'string' ){
      if( typeof value === 'undefined' ){
        return this.style[key];
      } else if( value == null ){
        this.style[key] = null;
      } else {
        this.style[key] = value;
      }
    } else if( typeof key === 'object' ){
      for( var i in key ){
        if( key[i] == null ){
          this.style[i] = null;
        } else {
          this.style[i] = key[i];
        }
      }
    }
  },
  load: function( obj ){
    if( this.xhr ){
      this.xhr.abort();
    }
    this.xhr = new XMLHttpRequest();
    this.xhrObject =  mii.validateXhrObject( obj );
    this.xhr.responseType = 'document'
    this.xhr.open( this.xhrObject.method, this.xhrObject.url );
    this.xhr.onreadystatechange = function( event ){
      if( this.xhr.readyState == 4 && this.xhr.status == 200 ){
        this.innerHTML = this.xhr.response.head.innerHTML + this.xhr.response.body.innerHTML;
        if( this.hasAttribute('data-eval-js') ){
          this.findByTag( 'script' ).forEach( ( node, index ) => {
            var newScript = document.createElement( 'script' );
            newScript.innerHTML = node.innerHTML;
            node.parentNode.replaceChild( newScript, node ).innerHTML = node.innerHTML;
          } );
        }
        this.xhrObject.onsuccess.call( this, this.xhr );
      }
    }.bind( this );
    this.xhr.send( this.xhrObject.data );
  },
  fullscreen: function(){
    if (this.requestFullscreen) {
        this.requestFullscreen();
    }
    else if (this.mozRequestFullScreen) {
        this.mozRequestFullScreen();
    }
    else if (this.webkitRequestFullScreen) {
        this.webkitRequestFullScreen();
    }
    else if (this.msRequestFullscreen) {
        this.msRequestFullscreen();
    }
  },
  isInViewport: function( topOffset, rightOffset, bottomOffset, leftOffset,  ){
    var rect = this.getBoundingClientRect();

    if( typeof bottomOffset == 'undefined' ){ bottomOffset = 0; }
    if( typeof rightOffset == 'undefined' ){ rightOffset = 0; }
    if( typeof leftOffset == 'undefined' ){ leftOffset = 0; }
    if( typeof topOffset == 'undefined' ){ topOffset = 0; }

    return ! ( ( rect.bottom + bottomOffset ) < 0 ||
        ( rect.right + rightOffset ) < 0 ||
        ( rect.left + leftOffset ) > window.innerWidth ||
        ( rect.top + topOffset ) > window.innerHeight );
  }
},false);

extend( HTMLCollection ).with({
  forEach: function( callable ){
    for( var i = 0; i < this.length; i++ ){
      callable.apply( this, [ this[i], i ] );
    }
  }
});

extend( HTMLCollection, NodeList ).with({
  on: function( eventTypes, a, b, c ){
    this.delegateFunction( 'on', arguments );
  },
  do: function( evenType ){
    this.delegateFunction( 'do', arguments );
  }
})

extend( Object ).with( {
  flatten: function( input, fa ){
    let output = {};    
    Object.keys( input ).forEach( function( key ) {
      if( input[ key ] == null ){
        output[ key ] = 'unknown';
      } else if ( ( typeof input[ key ] == 'object' ) && ( ( fa == true && Array.isArray( input[ key ] ) ) || ( !Array.isArray( input[ key ] ) ) ) ) {
        var _input = Object.flatten( input[ key ], fa );
        Object.keys( _input ).forEach( function( innerKey ) {
          output[ key + '.' + innerKey ] = _input[ innerKey ];
        } );
      } else {
        output[ key ] = input[ key ];
      }
    } );
  	return output;
  }
} );

extend( mii ).with( {
  template: {
    render: function( content, data, options ){
      var tags = ( typeof options === 'object' && options.hasOwnProperty('tags') ) ? options.tags : mii.defaults.template.tags;
      var values = Object.flatten( data );
      Object.keys( values ).forEach( ( key ) => {
        var value = values[ key ];
        var key = tags[0] + key + tags[1];
        content = content.replace( new RegExp( key , 'g'), value );
      } );
      return content;
    }
  },
  Gridify: function( element, options ){
    this.element = element;
    this.columns = this.element.find( '.column' );
    this.smallestColumn = null;
    this.topOffset = -300;

    this.itemTemplate = '';

    if( typeof options == 'object' ){
      for( var i in options ){
        this[i] = options[i];
      }
    }

    this.pager = this.element.appendChild( document.create( 'div', {
      className: 'pager',
      style: 'float: right; width: 100%'
    } ) );

    this.registerEventListeners = function(){
      window.addEventListener( 'scroll', ( event ) => {
        if( this.pager.isInViewport( this.topOffset ) && this.xhr == null ){
          this.nextPage();
        }
      });
    }
    this.nextPage = function( itemCreatedCallback ){
      var page = parseInt( this.element.getAttribute('data-page') );
      var perPage = parseInt( this.element.getAttribute('data-per-page') );
      var params = deserialize(  location.search.substring( 1, location.search.length ) );

      params['per-page'] = perPage;
      params['page'] = page;

      var params = serialize( params );

      var url = this.element.getAttribute('data-url');

      this.xhr = new XMLHttpRequest();
      this.xhr.open( 'GET', url + "?" + params );
      this.xhr.responseType = 'json';
      this.xhr.setRequestHeader( 'content-type', 'application/json' );
      this.xhr.onreadystatechange = function( event ){
        if( this.xhr.readyState == 4 ){
          if( this.xhr.status == 200 ){
            if( this.xhr.response.success ){
              this.xhr.response.items.forEach( ( item ) => {
                var element = document.createElement( 'div' );
                element.className = 'item';
                element.innerHTML = mii.template.render( this.itemTemplate, item );
                element.attr('data-loading', '');
                element.attr('data-load-type', 'bounce');

                this.add( element, item );
              } );
            }
          }
          this.xhr = null;
        }
      }.bind(this);
      this.xhr.send();

      this.element.setAttribute('data-page', ++page );
    }
    this.add = function( element, item ){
      var element = this.getSmallestColumn().appendChild( element );
      this.smallestColumn = this.getSmallestColumn();

      var event = new CustomEvent( 'add' );
      event.relatedElement = element;
      event.relatedItem = item;

      this.element.dispatchEvent( event );
    }
    this.getSmallestColumn = function(  ){
      var shortest = null;
      this.columns.forEach( function( node, index ){
        if( shortest == null || node.offsetHeight < shortest.offsetHeight ){
          shortest = node;
        }
      } )
      return shortest;
    }
    this.registerEventListeners();
    this.nextPage();
  }
}, true )
