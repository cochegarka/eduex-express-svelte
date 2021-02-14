<script>
    import { RouterLink } from "svelte-easyroute";
    import NavBar from "../components/NavBar.svelte";

    import { useCurrentRoute } from "svelte-easyroute";
    import { onDestroy } from "svelte";

    import { router } from "../router";
    
    let isAdminMode = false;
    let id = null;

    const unsubscribe = useCurrentRoute((currentRoute) => {
        isAdminMode = currentRoute?.query?.access === 'admin';
        id = currentRoute?.query?.id;
    });

    let dataPromise = (() => fetch(`http://localhost:3000/read/${id}`).then(r => r.json()))();

    function removeElement() {
        fetch(`http://localhost:3000/delete/${id}`, { method: 'DELETE' }).then(_ => router.push('/?access=admin'));
    }
    
    onDestroy(unsubscribe);
</script>

<div id="app">
    <NavBar {isAdminMode} />

    {#await dataPromise}
    {:then data}
    <section class="main-content columns is-fullheight">
        <div class="container is-fluid">
            <div class="section">
                <div class="card">
                    <div class="card-header">
                        <p class="card-header-title">
                            {data.short_name} - {data.title}
                        </p>
                        {#if isAdminMode}
                        <RouterLink
                            class="card-header-icon"
                            to={`/edit?mode=edit&access=admin&id=${id}`}
                            aria-label="edit"
                        >
                            <span class="icon">
                                <i class="fas fa-edit" aria-hidden="true" />
                            </span>
                        </RouterLink>
                        <a
                            class="card-header-icon"
                            on:click={removeElement}
                            aria-label="delete"
                        >
                            <span class="icon">
                                <i class="fas fa-trash" aria-hidden="true" />
                            </span>
                        </a>
                        {/if}
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <p><b>Ставка в час:</b> {data.pay.start} - {#if data.pay.end}{data.pay.end}{:else}...{/if} руб.</p>
                            <p><b>Опыт работы:</b> {data.seniority} лет</p>
                            <p>
                                {data.description}
                            </p>

                            <h5>Контакты</h5>

                            <p><b>Телефон</b>: {data.phone_number}</p>
                            <p><b>Электронная почта</b>: {data.email}</p>
                            {#if data.telegram.length > 0}
                            <p><b>Telegram</b>: {data.telegram}</p>
                            {/if}
                        </div>
                    </div>
                </div>

                <br />

                <div class="card">
                    <div class="card-header">
                        <p class="card-header-title">Информация о репетиторе</p>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <p><b>ФИО</b>: {data.full_name}</p>
                            <p><b>Возраст</b>: {data.age} лет</p>
                            <p><b>Опыт работы</b>: {data.seniority} лет</p>

                            <h5>О себе</h5>

                            <p>
                                {data.about}
                            </p>

                            <h5>Специализация</h5>

                            <ul>
                                {#each data.specialities as s}
                                <li>{s[1]}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/await}
</div>
