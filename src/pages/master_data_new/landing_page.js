import React from "react";
import Head from "next/head";
import styles from "styles/landing.module.css";



Landing_page.title = "Landing Page"

export default function Landing_page() {

    const features = [
        {
            title: "Tag Number",
            description: "Mengelola seluruh data Tag Number proyek."
        },
        {
            title: "Inspection Test Record",
            description: "Mengelola proses ITR secara digital."
        },
        {
            title: "Request For Inspection",
            description: "Pengajuan inspeksi secara online."
        },
        {
            title: "Punchlist",
            description: "Monitoring penyelesaian Punchlist."
        }
    ];

    return (

        <>

            <Head>

                <title>Mechanical Completion Monitoring</title>

            </Head>

            <header className={styles.header}>

                <div className={styles.container}>

                    <h1>PCMS</h1>

                    <nav>

                        <ul className={styles.menu}>

                            <li><a href="#home">Home</a></li>
                            <li><a href="#about">Tentang</a></li>
                            <li><a href="#feature">Fitur</a></li>
                            <li><a href="#technology">Teknologi</a></li>
                            <li><a href="#contact">Kontak</a></li>

                        </ul>

                    </nav>

                </div>

            </header>

            <main>

                {/* HERO */}

                <section
                    id="home"
                    className={styles.hero}
                >

                    <article>

                        <h2>

                            Sistem Informasi Monitoring Mechanical Completion

                        </h2>

                        <p>

                            Sistem berbasis web untuk membantu proses
                            Mechanical Completion mulai dari Tag Number,
                            ITR, RFI hingga Punchlist.

                        </p>

                        <button>

                            Pelajari Lebih Lanjut

                        </button>

                    </article>

                    <aside>

                        <image
                            src="/hero.png"
                            alt="Hero"
                        />

                    </aside>

                </section>

                {/* ABOUT */}

                <section
                    id="about"
                    className={styles.about}
                >

                    <h2>

                        Tentang Sistem

                    </h2>

                    <article>

                        <p>

                            Website ini dikembangkan menggunakan
                            Next.js, Nest.js dan PostgreSQL untuk
                            membantu monitoring Mechanical Completion
                            secara real-time.

                        </p>

                    </article>

                </section>

                {/* FEATURE */}

                <section
                    id="feature"
                    className={styles.feature}
                >

                    <h2>

                        Fitur Sistem

                    </h2>

                    <div className={styles.featureGrid}>

                        {

                            features.map((item, index) => (

                                <article
                                    key={index}
                                    className={styles.card}
                                >

                                    <h3>

                                        {item.title}

                                    </h3>

                                    <p>

                                        {item.description}

                                    </p>

                                </article>

                            ))

                        }

                    </div>

                </section>

                {/* TECHNOLOGY */}

                <section
                    id="technology"
                    className={styles.tech}
                >

                    <h2>

                        Teknologi

                    </h2>

                    <div className={styles.techGrid}>

                        <article>

                            <h3>Frontend</h3>

                            <p>Next.js</p>

                        </article>

                        <article>

                            <h3>Backend</h3>

                            <p>Nest.js</p>

                        </article>

                        <article>

                            <h3>Database</h3>

                            <p>PostgreSQL</p>

                        </article>

                    </div>

                </section>

                {/* SCREENSHOT */}

                <section
                    className={styles.screenshot}
                >

                    <h2>

                        Screenshot Sistem

                    </h2>

                    <img
                        src="/screenshot.png"
                        alt="Screenshot"
                    />

                </section>

            </main>

            <footer
                id="contact"
                className={styles.footer}
            >

                <p>

                    © 2026 Fauzan Ilharasky

                </p>

                <p>

                    Politeknik Negeri Batam

                </p>

            </footer>

        </>

    );

}