import { useState } from 'react';

const GitHubLink = () => {
const [iconSrc, setIconSrc] = useState("./images/github.png");

const handleMouseEnter = () => {
    setIconSrc("./images/githubHover.png");
};

const handleMouseLeave = () => {
    setIconSrc("./images/github.png");
};

return (
        <div className="github-link">
            <a href="https://github.com/dgp04/Quiz-Game" target="_blank" id="link">
            <img 
                src={iconSrc} 
                alt="GitHub icon" 
                title="Web Code" 
                id="icon" 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave} 
            />
            </a>
        </div>
    );
}

export default GitHubLink;
