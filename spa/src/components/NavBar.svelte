<script>
    import { RouterLink } from 'svelte-easyroute';

    export let isAdminMode;
</script>

<nav class="navbar" role="navigation" aria-label="main navigation" style="border-bottom: 1px solid lightgray;">
    <div class="navbar-brand">
        <RouterLink class="navbar-item" to={`/${isAdminMode ? '?access=admin' : ''}`}>
            <h1 class="title">EduEx</h1>
        </RouterLink>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
            data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="buttons">
                    <RouterLink class="button is-primary" to={`/edit?mode=create${isAdminMode ? '&access=admin' : ''}`}>
                        <strong>Создать резюме</strong>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</nav>