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
    this.paginate = function(){
      var page = parseInt( this.element.getAttribute('data-page') );
      var url = this.element.getAttribute('data-url');

      this.xhr = new XMLHttpRequest();
      this.xhr.open( 'GET', url + "?page=" + page );
      this.xhr.responseType = 'json';
      this.xhr.setRequestHeader( 'content-type', 'application/json' );
      this.xhr.onreadystatechange = function( event ){
        if( this.xhr.readyState == 4 && this.xhr.status == 200 ){
          console.log(this.xhr.response);
        }
      }.bind(this);
      this.xhr.send();

      console.log(page, url);
    }
    this.add = function( element ){
      this.getSmallestColumn().appendChild( element );
    }
    this.getSmallestColumn = function(  ){
      var shortest = null;
      this.columns.forEach( function( node, index ){
        if( shortest == null || node.offsetHeight < shortest.offsetHeight ){
          shortest = node;
        }
      } )
      console.log(shortest);
      return shortest;
    }
    this.paginate();
  }
}, true )
