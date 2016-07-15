window.onload = function()
{
    // set the menu event listeners
var menuItems = document.querySelectorAll( '.MenuItem' );
    
for (var a = 0 ; a < menuItems.length ; a++)
    {
    menuItems[ a ].addEventListener( 'click', menuClick );
    }

var url = window.location.href;

    // update state of the current history entry with the url
window.history.replaceState( url, document.title, url );

    // is called when the history changes (going back/forward)
window.addEventListener( 'popstate', function( event )
    {
    loadPageAjax( event.state );
    });
};


function menuClick( event )
{
    // left click, load with ajax
    // else, let the <a> element do its thing
if ( event.button !== 0 || event.ctrlKey || event.shiftKey )
    {
    return;
    }

var menuItem = this;
var url = menuItem.getAttribute( 'href' );

    // add to history
window.history.pushState( url, menuItem.textContent, url );

loadPageAjax( url );
}


function loadPageAjax( url )
{
    // show the loading element
var loading = document.getElementById( 'Loading' );
loading.classList.remove( 'hidden' );

var request = new XMLHttpRequest();
    
request.open( 'GET', url, true );
request.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
request.onload = function( event )
    {
    if ( request.readyState === 4 )
        {
        if ( request.status === 200 )
            {
            var content = document.getElementById( 'Content' );
                
            content.innerHTML = request.responseText;
            document.body.scrollTop = 0;
            }
            
        else
            {
            console.log( 'Error:', request.statusText );
            }

        loading.classList.add( 'hidden' );
        }
    };
request.onerror = function( event )
    {
    console.log( 'Error:', request.statusText );
    loading.classList.add( 'hidden' );
    };
request.send();
    
event.stopPropagation();
event.preventDefault();
}
