<script>
    import NavBar from "../components/NavBar.svelte";

    import { useCurrentRoute } from "svelte-easyroute";
    import { onDestroy } from "svelte";

    import { router } from "../router.js";
    
    let isAdminMode = false;
    let mode = 'create';
    let id = null;

    const unsubscribe = useCurrentRoute((currentRoute) => {
        isAdminMode = currentRoute?.query?.access === 'admin';
        mode = currentRoute?.query?.mode;
        if (mode == 'edit') {
            id = currentRoute?.query?.id;
        }
    });

    const fetchData = () => fetch(`http://localhost:3000/read/${id}`).then(r => r.json());
    const fetchSpecialities = () => fetch('http://localhost:3000/specialities').then(r => r.json()).then(obj => fillSpecialities(obj));
    
    function fillSpecialities(v) {
        return {
            title: "",
            pay: { start: "", end: "" },
            career_start: "",
            description: "",
            phone_number: "",
            email: "",
            telegram: "",
            full_name: "",
            short_name: "",
            date_of_birth: "",
            about: "",
            specialities: [],
            all_specialities: v.all_specialities,
            teacher_id: ""
        };
    }

    const form = {
        title: '',
        pay: { start: '', end: '' },
        career_start: '',
        description: '',
        phone_number: '',
        email: '',
        telegram: '',
        full_name: '',
        short_name: '',
        date_of_birth: '',
        about: '',
        specialities: [],
        all_specialities: [],
        speciality_id: 1,
        teacher_id: ''
    };

    const updateForm = (v) => {
        form.title = v.title;
        form.pay.start = v.pay.start;
        form.pay.end = v.pay.end;
        form.career_start = v.career_start;
        form.description = v.description;
        form.phone_number = v.phone_number;
        form.email = v.email;
        form.telegram = v.telegram;
        form.full_name = v.full_name;
        form.short_name = v.short_name;
        form.date_of_birth = v.date_of_birth;
        form.about = v.about;
        form.specialities = v.specialities;
        form.all_specialities = v.all_specialities;
        form.speciality_id = v.specialities > 1 ? v.specialities[0][0] : 1;
        form.teacher_id = v.teacher_id;

        v;
    };

    let dataPromise = (mode === 'edit' ? fetchData : fetchSpecialities)().then(updateForm);

    function sendData() {
        fetch(mode === 'create' ? 'http://localhost:3000/create' : `http://localhost:3000/update/${id}`, {
            method: mode === 'create' ? 'POST' : 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        }).then(v => v.json()).then(v => router.push(`/profile?id=${v.id}${isAdminMode ? '&access=admin' : ''}`));
    }

    function goBack() {
        if (mode === 'create') {
            router.push(`/${isAdminMode ? '?access=admin' : ''}`);
        } else {
            router.push(`/profile?id=${id}${isAdminMode ? '&access=admin' : ''}`);
        }
    }

    onDestroy(unsubscribe);
</script>

<div id="app">
    <NavBar {isAdminMode} />

    {#await dataPromise}
    {:then _}
    <section class="main-content columns is-fullheight">
        <div class="container is-fluid">
            <div class="section">
                <div class="card">
                    <div class="card-header">
                        <p class="card-header-title">Объявление</p>
                        <a class="card-header-icon" aria-label="save" on:click={sendData}>
                            <span class="icon">
                                <i class="fas fa-save" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a class="card-header-icon" aria-label="reject" on:click={goBack}>
                            <span class="icon">
                                <i class="fas fa-ban" aria-hidden="true"></i>
                            </span>
                        </a>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <div class="field">
                                <label class="label">Название объявления</label>
                                <div class="control">
                                    <input class="input" type="text" placeholder="Название" bind:value={form.title}>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Ставка за час</label>
                                <div class="control columns">
                                    <div class="column"><input class="input" type="text" placeholder="От" bind:value={form.pay.start}></div>
                                    <div class="column"><input class="input" type="text" placeholder="До" bind:value={form.pay.end}></div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Дисциплина</label>
                                <div class="control">
                                    <div class="select">
                                        <select bind:value={form.speciality_id}>
                                            {#each form.all_specialities as [i, s]}
                                            <option value={i}>{s}</option>
                                            {/each}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Описание объявления</label>
                                <div class="control">
                                    <textarea class="textarea" placeholder="Описание" bind:value={form.description}></textarea>
                                </div>
                            </div>

                            <div class="field is-grouped">
                                <div class="control">
                                    <button class="button is-link" on:click={sendData}>Сохранить</button>
                                </div>
                                <div class="control">
                                    <button class="button is-link is-light" on:click={goBack}>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <br />

                <div class="card">
                    <div class="card-header">
                        <p class="card-header-title">Информация о репетиторе</p>
                        <a class="card-header-icon" aria-label="save" on:click={sendData}>
                            <span class="icon">
                                <i class="fas fa-save" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a class="card-header-icon" aria-label="reject" on:click={goBack}>
                            <span class="icon">
                                <i class="fas fa-ban" aria-hidden="true"></i>
                            </span>
                        </a>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <div class="content">
                                <div class="field">
                                    <label class="label">ФИО</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="ФИО" bind:value={form.full_name}>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Сокращенное обращение</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="Сокращенное обращение" bind:value={form.short_name}>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Дата рождения (в формате ГГГГ-ММ-ДД)</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="Дата рождения" bind:value={form.date_of_birth}>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Год начала преподавательской карьеры (в формате ГГГГ)</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="Начало карьеры" bind:value={form.career_start}>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">О себе</label>
                                    <div class="control">
                                        <textarea class="textarea" placeholder="О себе" bind:value={form.about}></textarea>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Номер телефона:</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="Номер телефона" bind:value={form.phone_number}>
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Электронная почта:</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="Электронная почта" bind:value={form.email}>
                                    </div>
                                </div>


                                <div class="field">
                                    <label class="label">Telegram:</label>
                                    <div class="control">
                                        <input class="input" type="text" placeholder="Telegram" bind:value={form.telegram}>
                                    </div>
                                </div>

                                <div class="field is-grouped">
                                    <div class="control">
                                        <button class="button is-link" on:click={sendData}>Сохранить</button>
                                    </div>
                                    <div class="control">
                                        <button class="button is-link is-light" on:click={goBack}>Отмена</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

    </section>
    {/await}

</div>