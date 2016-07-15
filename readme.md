In this tutorial we'll see a simple example of how to do a ajax website with django.

It will be a website with only 2 pages (keeping it simple to be easier to read), where you can switch the normal way (full page reload) or with ajax (partial page reload).

We'll build the website incrementally, adding functionality one at a time.

I assume the reader has some basic knowledge of django and javascript, so I won't be explaining all of it. For a more  thorough example, check the official [django tutorial](https://docs.djangoproject.com/en/1.9/intro/tutorial01/).


# Basic Website #

We'll start by writing a normal website first. This will serve as the foundation for the rest of the work.


## views.py ##

    from django.shortcuts import render
    
    def page1( request ):
        return render( request, 'page1.html' )
    
    def page2( request ):
        return render( request, 'page2.html' )

## urls.py ##

    from django.conf.urls import url
    from website import views
    
    urlpatterns = [
        url( r'^$', views.page1, name= 'page1' ),
        url( r'^page2$', views.page2, name= 'page2' ),
    ]

## base.html ##

    <!DOCTYPE html>
    <html>
        <head>
            <title>Website Example</title>
        </head>
    <body>
        <ul>
            <li><a href="{% url 'page1' %}">Page 1</a></li>
            <li><a href="{% url 'page2' %}">Page 2</a></li>
        </ul>
    
        {% block content %}{% endblock %}
    </body>
    </html>

## page1.html ##

    {% extends "base.html" %}
    
    {% block content %}Page 1{% endblock %}

## page2.html ##

    {% extends "base.html" %}
    
    {% block content %}Page 2{% endblock %}

A very basic website. Two pages, and a menu to change between them. Can't get easier than this.


# Prepare Backend for Async #

Now, lets prepare the backend. It needs to be able to send either the whole page, or just the content.

We'll want to be able to choose whether to extend the `base.html` or not. Since we can't have an `extends` tag inside a `if` in a django template, we'll add a new base template for ajax requests instead.

## views.py ##

    from django.shortcuts import render
    
    BASE_AJAX = 'base_ajax.html'
    
    def page1( request ):
        context = {}
        if request.is_ajax():
            context[ 'base' ] = BASE_AJAX
    
        return render( request, 'page1.html', context )
    
    def page2( request ):
        context = {}
        if request.is_ajax():
            context[ 'base' ] = BASE_AJAX
    
        return render( request, 'page2.html', context )

## base_ajax.html ##

    {% block content %}{% endblock %}

## page1.html ##

    {% extends base|default:"base.html" %}
    
    {% block content %}Page 1{% endblock %}

## page2.html ##

    {% extends base|default:"base.html" %}
    
    {% block content %}Page 2{% endblock %}

So, when its a normal request, page1 and page2 extend the normal `base.html`. Otherwise they extend the `base_ajax.html` which is simply the page's content.

# Front-end #

Alright, now lets do the front-end part. We'll use the `XMLHttpRequest` object to make the request for the content of the new page, then change the content once that is done, all with javascript.

## base.html ##

    {% load static %}
    <!DOCTYPE html>
    <html>
        <head>
            <title>Website Example</title>
            <script type="text/javascript" src="{% static 'main.js' %}"></script>
        </head>
    <body>
        <ul>
            <li><a class="MenuItem" href="{% url 'page1' %}">Page 1</a></li>
            <li><a class="MenuItem" href="{% url 'page2' %}">Page 2</a></li>
        </ul>
    
        <div id="Content">{% block content %}{% endblock %}</div>
    
    </body>
    </html>

We added the `main.js` script, and a class name to the menu items, and id to the content, so we can reference it later.

## main.js ##

    window.onload = function()
    {
        // set the menu event listeners
    var menuItems = document.querySelectorAll( '.MenuItem' );
        
    for (var a = 0 ; a < menuItems.length ; a++)
        {
        menuItems[ a ].addEventListener( 'click', menuClick );
        }
    };
    
    
    function menuClick( event )
    {
        // load the page with ajax on left click
        // otherwise let the <a> element do its thing
    if ( event.button !== 0 || event.ctrlKey || event.shiftKey )
        {
        return;
        }
    
    var menuItem = this;
    var url = menuItem.getAttribute( 'href' );
    
    loadPageAjax( url );
    }
    
    
    function loadPageAjax( url )
    {
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
            }
        };
    request.onerror = function( event )
        {
        console.log( 'Error:', request.statusText );
        };
    request.send();
        
    event.stopPropagation();
    event.preventDefault();
    }

We set a click listener to all the menu elements. In there we override the normal behavior of the `<a>` element and do the request ourselves with the `XMLHttpRequest`. Once that is done, its just a matter of changing the content and we're done! Make sure you set the `X-Requested-With` header to `XMLHttpRequest` so that the server can differentiate between the different kind of requests.

When javascript is enabled, it will do the request, and change the content with ajax, otherwise it will reload the whole page (by clicking on the `<a>` element), so it works regardless.

# Loading Element #

Its always a good idea to show the user what is happening, so we'll show a loading message when we're going to a different page. You're free to add some fancy animation instead :)

## base.html ##

    {% load static %}
    <!DOCTYPE html>
    <html>
        <head>
            <title>Website Example</title>
    
            <link rel="stylesheet" href="{% static 'style.css' %}" />
            <script type="text/javascript" src="{% static 'main.js' %}"></script>
        </head>
    <body>
        <ul>
            <li><a class="MenuItem" href="{% url 'page1' %}">Page 1</a></li>
            <li><a class="MenuItem" href="{% url 'page2' %}">Page 2</a></li>
        </ul>
    
        <div id="Content">{% block content %}{% endblock %}</div>
        <div id="Loading" class="hidden">Loading..</div>
    </body>
    </html>

Add a link to the stylesheet file for some styling of the loading element, and add the loading element itself.

## style.css ##

    #Loading {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    
    .hidden {
        display: none;
    }

Position the loading element on the center of the screen.
We'll show/hide the element by removing/adding the `hidden` class.

## main.js ##

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


We remove the `hidden` class from the loading element to show it during the loading, and once its all done we simply re-add it. 

# History #

We're almost there, now what is missing is updating the url/history. Right now if we switch between the pages, the url isn't updated nor the browsing history, so if the user wants to go back, it won't go as expected.

To fix this, we'll need to set the history ourselves, with the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API).

## main.js ##

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

When we load a new page with ajax, we add a new state to the history, with the url that we changed to.

When the history is changed (for example when clicking `back` on the browser), the `popstate` is triggered and we load the page based on the given saved state.

When the page is initially loaded, the history doesn't have the state in the format we're using, so use the `history.replaceState()` to update it, so it all works as expected.


That's it! We've done it! We have a website that works with ajax requests if javascript is enabled, works with `<a>` elements if it isn't. Gets the history updated as expected, so going back/forward is available to use.

Thanks for reading!
