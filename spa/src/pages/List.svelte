<script>
    import { RouterLink } from "svelte-easyroute";
    import NavBar from "../components/NavBar.svelte";

    import { useCurrentRoute } from "svelte-easyroute";
    import { onDestroy } from "svelte";
    import { range } from "../utils/range";
    
    const HAS_SIDEBAR = false;

    let isAdminMode = false;
    let page = 1;

    const unsubscribe = useCurrentRoute((currentRoute) => {
        isAdminMode = currentRoute?.query?.access === 'admin';
    });

    let dataPromiseGenerator = (page) => fetch(`http://localhost:3000/list/${page}`).then(r => r.json());
    let dataPromise = dataPromiseGenerator(page);

    async function removeElement(id) {
        fetch(`http://localhost:3000/delete/${id}`, { method: 'DELETE' }).then(_ => dataPromise = dataPromiseGenerator(page));
    }

    function setPage(n) {
        page = n;
        dataPromise = dataPromiseGenerator(page);
    }
    
    onDestroy(unsubscribe);
</script>

<div id="app">
    <NavBar {isAdminMode} />

    <section class="main-content columns is-fullheight">
        {#if HAS_SIDEBAR}
        <aside
            class="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile"
            style="border-right: 1px solid lightgray;"
        >
            <ul class="menu-list">
                <li>
                    <p class="menu-label is-hidden-touch">Профиль обучения</p>
                    <ul>
                        <li><a>Английский язык</a></li>
                        <li><a>Обществознание</a></li>
                        <li><a>Информатика</a></li>
                        <li><a>Математика</a></li>
                        <li><a>Физика</a></li>
                        <li><a>Русский язык и литература</a></li>
                        <li><a>...</a></li>
                    </ul>
                </li>
                <li>
                    <br />
                    <p class="menu-label is-hidden-touch">Ставка в час</p>
                    <div class="columns">
                        <div class="column">
                            <input class="input" type="text" placeholder="От" />
                        </div>
                        <div class="column">
                            <input class="input" type="text" placeholder="До" />
                        </div>
                    </div>
                </li>
                <li>
                    <br />
                    <p class="menu-label is-hidden-touch">Стаж работы</p>
                    <ul>
                        <li><a>Более 30 лет</a></li>
                        <li><a>От 15 до 30 лет</a></li>
                        <li><a>От 10 до 15 лет</a></li>
                        <li><a>От 5 до 10 лет</a></li>
                        <li><a>От года до 5 лет</a></li>
                        <li><a>Менее года</a></li>
                    </ul>
                </li>
                <li>
                    <br />
                    <p class="menu-label is-hidden-touch">Возраст</p>
                    <ul>
                        <li><a>18-30 лет</a></li>
                        <li><a>30-40 лет</a></li>
                        <li><a>50-60 лет</a></li>
                        <li><a>Старше 60 лет</a></li>
                    </ul>
                </li>
            </ul>
        </aside>
        {/if}

        <div class="container column is-10">
            {#await dataPromise}
            {:then data}
            <div class="section">
                <div>
                    <nav
                        class="pagination"
                        role="navigation"
                        aria-label="pagination"
                    >
                        {#if data.count >= 10}
                        {#if page > 1}
                        <a class="pagination-previous" on:click={() => setPage(page - 1)}>Назад</a>
                        {/if}
                        {#if page < Math.ceil(data.count / 10)}
                        <a class="pagination-next" on:click={() => setPage(page + 1)}>Вперед</a>
                        {/if}
                        {/if}
                        <ul class="pagination-list">
                            {#each range(1, Math.ceil(data.count / 10), 1) as i}
                            {#if i == page}
                            <li>
                                <a
                                    class="pagination-link"
                                    aria-label="Goto page" on:click={() => setPage(i)}>{i}</a
                                >
                            </li>
                            {:else}
                            <li>
                                <a
                                    class="pagination-link is-current"
                                    aria-label="Goto page" on:click={() => setPage(i)}>{i}</a
                                >
                            </li>
                            {/if}
                            {/each}
                        </ul>
                    </nav>
                </div>

                <br />

                {#if isAdminMode}
                <div>
                    <RouterLink
                        class="button is-primary"
                        to={"/edit?mode=create&access=admin"}>Добавить резюме</RouterLink
                    >
                </div>
                {/if}

                <br />

                {#each data.list as v}
                <div class="card">
                    <div class="card-header">
                        <p class="card-header-title">
                            <RouterLink to={`/profile?id=${v.id}${isAdminMode ? '&access=admin' : ''}`}
                                >{v.short_name} - {v.title}</RouterLink
                            >
                        </p>
                        {#if isAdminMode}
                        <RouterLink
                            class="card-header-icon"
                            aria-label="edit"
                            to={`/edit?mode=edit&access=admin&id=${v.id}`}
                        >
                            <span class="icon">
                                <i class="fas fa-edit" aria-hidden="true" />
                            </span>
                        </RouterLink>
                        <a class="card-header-icon" aria-label="delete" on:click={() => removeElement(v.id)}>
                            <span class="icon">
                                <i class="fas fa-trash" aria-hidden="true" />
                            </span>
                        </a>
                        {/if}
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <p>Возраст: {v.age} лет</p>
                            <p><b>Ставка в час</b>: {v.pay.start} - {#if v.pay.end}{v.pay.end}{:else}...{/if} руб.</p>
                            <p>Опыт работы: {v.seniority} лет</p>
                            <p>
                                {v.description}
                            </p>
                            <p><b>Телефон</b>: {v.phone_number}</p>
                        </div>
                    </div>
                </div>
                <br />
                {/each}

                <div>
                    <nav
                        class="pagination"
                        role="navigation"
                        aria-label="pagination"
                    >
                        {#if data.count >= 10}
                        {#if page > 1}
                        <a class="pagination-previous" on:click={() => setPage(page - 1)}>Назад</a>
                        {/if}
                        {#if page < Math.ceil(data.count / 10)}
                        <a class="pagination-next" on:click={() => setPage(page + 1)}>Вперед</a>
                        {/if}
                        {/if}
                        <ul class="pagination-list">
                            {#each range(1, Math.ceil(data.count / 10), 1) as i}
                            {#if i == page}
                            <li>
                                <a
                                    class="pagination-link"
                                    aria-label="Goto page" on:click={() => setPage(i)}>{i}</a
                                >
                            </li>
                            {:else}
                            <li>
                                <a
                                    class="pagination-link is-current"
                                    aria-label="Goto page" on:click={() => setPage(i)}>{i}</a
                                >
                            </li>
                            {/if}
                            {/each}
                        </ul>
                    </nav>
                </div>
            </div>
            {/await}
        </div>
    </section>
</div>
