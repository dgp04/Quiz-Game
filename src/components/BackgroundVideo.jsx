/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";

export default function BackgroundVideo({ category, children }) {
    const videoRef = useRef(null);

    const getVideoSource = (category) => {
        const videoMap = {
            video: "/videos/videogames.mp4",
            history: "/videos/history.mp4",
            sports: "/videos/sports.mp4",
            general: "/videos/generalKnowledge.mp4",
            books: "/videos/books.mp4",
            film: "/videos/movies.mp4",
            theatre: "/videos/theatre.mp4",
            music: "/videos/music.mp4",
            television: "/videos/tv.mp4",
            board: "/videos/boardGames.mp4",
            nature: "/videos/science.mp4",
            computers: "/videos/computers.mp4",
            mathematics: "/videos/maths.mp4",
            mythology: "/videos/myth.mp4",
            geography: "/videos/geography.mp4",
            politics: "/videos/politics.mp4",
            art: "/videos/art.mp4",
            celebrities: "/videos/celebrities.mp4",
            animals: "/videos/animals.mp4",
            vehicles: "/videos/vehicles.mp4",
            comics: "/videos/comics.mp4",
            gadgets: "/videos/computers.mp4",
            anime: "/videos/anime.mp4",
            cartoon: "/videos/cartoon.mp4",
        };

        const lowerCategory = category.toLowerCase();

        // Buscar subcategorías que contengan el nombre parcial
        const match = Object.keys(videoMap).find((key) =>
            lowerCategory.includes(key)
        );

        return videoMap[match] || "/videos/default.mp4";
    };

    const videoSource = getVideoSource(category);

    // Forzar la reproducción al cambiar la categoría
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.load();
            videoRef.current.play();
        }
    }, [videoSource]);

    return (
        <div>
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: "-1",
                }}
            >
                <source src={videoSource} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div style={{ position: "relative", zIndex: "2" }}>{children}</div>
        </div>
    );
}
