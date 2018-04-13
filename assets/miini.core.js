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
  create: function( tag, options ){
    var el = document.createElement( tag );

    if( typeof options == 'object' ){
      for( var i in options ){
        if( typeof el[i] !== 'undefined' ){
          el[i] = options[i];
        } else {
          el.setAttribute( i, options[i] );
        }
      }
    }
    return el;
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
        this.dataset[key] = null;
      } else {
        this.dataset[key] = value;
      }
    } else if( typeof key === 'object' ){
      for( var i in key ){
        if( key[i] == null ){
          this.dataset[i] = null;
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
      }
    }.bind( this );
    this.xhr.send( this.xhrObject.data );
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

extend( mii ).with( {
  Gridify: function( element ){
    this.element = element;
    this.columns = this.element.find( '.column' );
    this.smallestColumn = null;
    this.topOffset = -300;
    this.pager = this.element.appendChild( document.create( 'div', {
      className: 'pager',
      style: 'float: right; width: 100%'
    } ) );

    this.registerEventListeners = function(){
      window.addEventListener( 'scroll', ( event ) => {
        // console.log( this.pager.isInViewport( this.topOffset ) );
        if( this.pager.isInViewport( this.topOffset ) ){
          this.paginate();
        }
      });
    }
    this.paginate = function(){
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
        if( this.xhr.readyState == 4 && this.xhr.status == 200 ){
          if( this.xhr.response.success ){
            this.xhr.response.items.forEach( ( item ) => {
              console.log("height: " + item.image.small.height);
            this.add( document.create( 'div', {
                className: 'block cw-xs-100',
                style: "height: " + item.image.small.height,
                innerHTML: '<div class="content" style="background-image:url( ' + item.image.small.url + ' )" ></div>'
              } ) )
            } );
          }
        }
      }.bind(this);
      this.xhr.send();

      this.element.setAttribute('data-page', ++page );
    }
    this.add = function( element ){
      this.getSmallestColumn().appendChild( element );
      this.smallestColumn = this.getSmallestColumn();
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
    this.paginate();
  }
}, true )
