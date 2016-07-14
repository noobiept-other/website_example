window.onload = function()
{
var menuItems = document.querySelectorAll( '.MenuItem' );
    
for (var a = 0 ; a < menuItems.length ; a++)
    {
    menuItems[ a ].addEventListener( 'click', menuClick );
    }
};


function menuClick( event )
{
    // left click, load with ajax
    // else, let the <a> element do its thing
if ( event.button !== 0 || event.ctrlKey || event.shiftKey )
    {
    return;
    }

    // show the loading element
var loading = document.getElementById( 'Loading' );
loading.classList.remove( 'hidden' );

var menuItem = this;
var request = new XMLHttpRequest();
    
request.open( 'GET', menuItem.getAttribute( 'href' ), true );
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
