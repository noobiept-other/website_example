In this tutorial we'll see a simple example of how to do a ajax website with django.

It will be a website with only 2 pages (keeping it simple to be easier to read), where you can switch the normal way (full page reload) or with ajax (partial page reload).

We'll build the website incrementally, adding functionality one at a time.

I assume the reader has some basic knowledge of django and javascript, so I won't be explaining all of it. If interested go through the official [django tutorial](https://docs.djangoproject.com/en/1.9/intro/tutorial01/).


# Basic Website #

First, lets just write a normal website, gotta start at the beginning.
The ajax is only a compliment to an already existing working website.

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

Basic website, 2 pages, a menu to change between the 2. Can't get easier than this.

# Ajax Backend #

Now, lets prepare the backend. It needs to be able to send either the whole page, or just the content.
Since we can't if/else an `extends` in django, we'll add a new base template for ajax requests.

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

So, when its a normal request, page1 and page2 extend the normal `base.html`. Otherwise they extend the `base_ajax.html` which is simply the pages content.

# XMLHttpRequest - front end part #

Alright now, lets do the front-end part. We'll use the `XMLHttpRequest` object to make the request for the content of the new page, then change the content once that is done, all with javascript.

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

We set a click listener to all the menu elements. In there we override the normal behavior of the `<a>` element and do the request ourselves with the `XMLHttpRequest`. Once that is done, its just a matter of changing the content and we're done! Make sure you set the `X-Requested-With` header to `XMLHttpRequest` so that the server can differentiate between the different kinds of requests.

When javascript is enabled, it will do the request, and change the content, otherwise it will reload the whole page (by clicking on the `<a>` element).

# Loading element #

Its always a good idea to show the user what is happening, so we'll show a loading message when we're going to a different page. You're free to add some fancy animation later :)

(code)

# History #

Alright, almost there, now what is missing is updating the url/history. Right now if we switch between the pages, the url isn't updated nor the browsing history, so if the user wants to go back, it won't go as expected.

To fix this, we'll need to set the history ourselves, with the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API).

(code here)


That's it! We've done it! We have a website that works with ajax requests if javascript is enabled, works with `<a>` elements if it isn't. Gets the history updated as expected, so going back/forward is available to use.

Here's a link to the code (bitbucket) and live (heroku link).
Thanks for reading!
