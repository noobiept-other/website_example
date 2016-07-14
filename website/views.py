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
