# Word Builder Arcade 🎮

A fun, colorful word-building game designed for kids ages 7-10! Letters fall from the sky and players click them to spell words.

![Word Builder Arcade](https://img.shields.io/badge/Game-Word%20Builder-purple)
![Age Range](https://img.shields.io/badge/Ages-7--10-green)
![Tech](https://img.shields.io/badge/Tech-HTML%2FCSS%2FJS-blue)

## 🎯 How to Play

1. **Start the Game**: Choose your difficulty level and click "Start Game!"
2. **Catch Letters**: Letters fall from the top of the screen
3. **Build Words**: Click letters in order to spell a word
4. **Submit**: Click "Submit Word" when you've spelled a valid word
5. **Score Points**: Longer words = more points!
6. **Beat the Clock**: Game ends when time runs out

## 🏆 Scoring System

| Word Length | Base Points |
|-------------|-------------|
| 3 letters   | 10 points   |
| 4 letters   | 25 points   |
| 5 letters   | 50 points   |
| 6+ letters  | 100 points  |

**Combo Multiplier**: Consecutive valid words multiply your score! (x2, x3, x4...)

## 🎚️ Difficulty Levels

- **🐢 Beginner**: Slow falling letters, 3 minute rounds - perfect for younger players
- **🐰 Normal**: Medium speed, 2:30 minute rounds - balanced challenge
- **🚀 Advanced**: Fast falling letters, 2 minute rounds - for word masters!

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern web browser!

### Option 2: Local Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```
Then visit `http://localhost:8000`

### Option 3: Host Online
Upload all files to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

## 📁 Project Structure

```
word-builder-arcade/
├── index.html      # Main game HTML
├── styles.css      # All styling and animations
├── game.js         # Game logic and mechanics
├── dictionary.js   # Word validation dictionary
└── README.md       # This file
```

## ✨ Features

- 🎨 Bright, colorful, kid-friendly interface
- 📱 Responsive design (tablets & desktops)
- 🔤 Large, easy-to-click letters
- 🎵 Fun sound effects
- ✅ 2000+ kid-appropriate words
- ⏸️ Pause functionality
- 🏆 High score tracking
- 🎉 Celebration animations
- ⌨️ Keyboard shortcuts (Enter to submit, Escape to clear)

## 🎹 Controls

- **Click/Tap**: Select falling letters
- **Submit Word Button**: Submit your word
- **Clear Button (✖️)**: Clear current selection
- **Pause Button (⏸️)**: Pause/resume game

### Keyboard Shortcuts
- `Enter`: Submit word
- `Escape` or `Backspace`: Clear current word
- `Space`: Pause/Resume

## 🛠️ Technical Details

- **No Dependencies**: Pure HTML, CSS, and vanilla JavaScript
- **Local Storage**: High scores saved in browser
- **Web Audio API**: Sound effects generated programmatically
- **CSS Animations**: Smooth, performant animations
- **Touch Support**: Works great on tablets

## 📝 License

Free to use for educational purposes. Perfect for:
- Elementary school classrooms
- Homeschool activities
- Kids' websites
- Educational game collections

---

Made with ❤️ for young word builders everywhere!
