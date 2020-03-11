(function($, Mustache, GoogleAPI) {
    function updateMenuItem($el) {
        var $submenu = $el.find('ul');

        if ( $el.hasClass('menu-collapsed') )  {
            $submenu.hide();
        } else {
            $submenu.show();
        }
    }

    function toggleSubMenu($el) {
        var newClass = $el.hasClass('menu-collapsed') ? 'menu-expanded' : 'menu-collapsed';
        $el.removeClass().addClass(newClass);
        updateMenuItem($el);
    }

    function convertLessons(data) {
        function byName(a, b) {
            return a.name.localeCompare(b.name);
        }

        data.folders.sort(byName);
        data.folders.forEach(function(folder) {
            folder.files.sort(byName);
        });

        return {
            title: data.name,
            items: data.folders.map(function(folder) {
                return {
                    name: folder.name,
                    hasSubItems: true,
                    items: folder.files
                }
            })
        };
    }

    function redirectToLogin() {
        window.location.href = 'Login.html?from=lessons.html';
    }

    function updateView($iframe, id) {
        var url = 'https://docs.google.com/document/d/' + id + '/edit?rm=minimal&widget=true';
        $iframe.attr('src', url);
    }

    function renderUserView(data) {
        var content = Mustache.render($('#lessons-user').html(), {
            name: data.result.displayName,
            avatar: data.result.image.url
        });

        $('.user-info').html(content);
        $('.user-avatar').on('load', function () {
            $(this).show();
        });

        $('#logout').on('click', function(e) {
            e.preventDefault();
            GoogleAPI.signOut().then(redirectToLogin);
        });
    }

    GoogleAPI.init().then(function() {
        if ( GoogleAPI.isSignedIn() ) {
            GoogleAPI.userInfo().then(renderUserView);
        } else {
            redirectToLogin();
        }
    });

    $.getJSON('data/lessons.json').then(function(data) {
        var content = Mustache.render( $('#lessons-menu').html(), convertLessons(data) ),
            $iframe = $('.lesson-view iframe'),
            $menu, $menuItems;

        $('.lessons-menu-container').html(content);

        $menu = $('.lessons-menu');
        $menuItems = $('li', $menu);

        $('.submenu-toggle', $menu).on('click', function(e) {
            e.preventDefault();
            toggleSubMenu( $(this).parent() );
        });

        $menuItems.each(function() {
            updateMenuItem( $(this) );
        });

        $('a[data-fileId]', $menu).on('click', function (e) {
            var id = $(this).data('fileid'),
                $item = $(this).parent();

            e.preventDefault();

            if ( !$item.hasClass('active') ) {
                $menuItems.removeClass('active');
                $item.addClass('active');

                updateView($iframe, id)
            }
        })

    });

}(jQuery, Mustache, GoogleAPI));