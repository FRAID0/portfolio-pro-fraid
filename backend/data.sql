--
-- PostgreSQL database dump
--

\restrict Czaaj2YCgvnoNcvBFw6dnMTjMHU2nJCgblLcwm2v6PHzuGc5xbh807xeHLP0UTl

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: fraid
--

INSERT INTO public."Message" (id, "senderName", "senderEmail", content, "isPrivate", "createdAt") VALUES (1, 'test', 'fraidyfomekong@gmail.com', 'test', true, '2026-01-23 23:12:29.039');


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: fraid
--

INSERT INTO public."Project" (id, title, description, category, tech, "imageUrl", "githubLink", "liveLink", "createdAt") VALUES (1, 'Sudoku Solver - IoT', 'Un solveur de Sudoku intelligent intégrant la vision par ordinateur et une interface physique.', 'IOT', 'Python, Docker, Raspberry Pi', 'https://fraid0.github.io/portofolio_FRAID/images/sudoku.jpg', NULL, NULL, '2026-01-22 23:02:51.11');
INSERT INTO public."Project" (id, title, description, category, tech, "imageUrl", "githubLink", "liveLink", "createdAt") VALUES (2, 'SkillBridge', 'Plateforme de mise en relation pour l échange de compétences et le mentorat.', 'WEB', 'React, Node.js, PostgreSQL', 'https://fraid0.github.io/portofolio_FRAID/images/skillbridge.jpg', NULL, NULL, '2026-01-22 23:02:51.11');
INSERT INTO public."Project" (id, title, description, category, tech, "imageUrl", "githubLink", "liveLink", "createdAt") VALUES (3, 'EMA - Fleet Management', 'Application mobile pour la gestion et le suivi en temps réel d une flotte de véhicules.', 'MOBILE', 'Flutter, Firebase, Dart', 'https://fraid0.github.io/portofolio_FRAID/images/ema.jpg', NULL, NULL, '2026-01-22 23:02:51.11');
INSERT INTO public."Project" (id, title, description, category, tech, "imageUrl", "githubLink", "liveLink", "createdAt") VALUES (4, 'TOP Project', 'Projet orienté équipe développant une architecture cloud robuste.', 'FULLSTACK', 'Angular, Java, AWS', 'https://fraid0.github.io/portofolio_FRAID/images/top.jpg', NULL, NULL, '2026-01-22 23:02:51.11');


--
-- Data for Name: Skill; Type: TABLE DATA; Schema: public; Owner: fraid
--



--
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fraid
--

SELECT pg_catalog.setval('public."Message_id_seq"', 1, true);


--
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fraid
--

SELECT pg_catalog.setval('public."Project_id_seq"', 4, true);


--
-- Name: Skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fraid
--

SELECT pg_catalog.setval('public."Skill_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict Czaaj2YCgvnoNcvBFw6dnMTjMHU2nJCgblLcwm2v6PHzuGc5xbh807xeHLP0UTl

