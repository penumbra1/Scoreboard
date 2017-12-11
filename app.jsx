// Initial player array for illustration purposes, can be removed.
const PLAYERS = [
    {
        name: "Andrey",
        score: 0,
        id: 1
    },
    {
        name: "Sam",
        score: 0,
        id: 2
    }
];

function Header(props) {
    return (
        <div className="header">
            <Stats players={props.players} />
            <h1>{props.title}</h1>
            <Stopwatch />
        </div>
    );
}

// PropTypes is now in a separate library (imported as its own <script>).

// Title can be required
// as it's passed down from Application props where it has a default value.
Header.propTypes = {
    title: PropTypes.string.isRequired,
    players: PropTypes.array.isRequired
};

// Using class for tracking input state.
class AddPlayerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: ""
        };
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.onAdd(this.state.name);
        // Clean up input and state.
        e.target.reset();
        this.setState({
            name: ""
        });
    }

    onNameChange(e) {
        this.setState({
            name: e.target.value
        });
    }

    render() {
        return (
            <div className="add-player-form">
                <form onSubmit={this.onSubmit.bind(this)}>
                    <input
                        type="text"
                        onChange={this.onNameChange.bind(this)}
                    />
                    <input type="submit" value="Add Player" />
                </form>
            </div>
        );
    }
}

AddPlayerForm.propTypes = {
    onAdd: PropTypes.func.isRequired
};

class Stopwatch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            running: false,
            elapsedTime: 0,
            previousTime: 0
        };
    }

    onStop() {
        this.setState({
            running: false
        });
    }

    onStart() {
        this.setState({
            running: true,
            previousTime: Date.now()
        });
    }

    onReset() {
        this.setState({
            previousTime: Date.now(),
            elapsedTime: 0
        });
    }

    onTick() {
        if (this.state.running) {
            const now = Date.now();
            this.setState({
                previousTime: now,
                elapsedTime:
                    this.state.elapsedTime + (now - this.state.previousTime)
            });
        }
        console.log("tick");
    }

    componentDidMount() {
        // Interval is not a part of state as it's not used in render.
        // See https://reactjs.org/docs/state-and-lifecycle.html
        this.interval = setInterval(this.onTick.bind(this), 100);
    }

    componentWillUnmount() {
        // Clean up memory
        clearInterval(this.interval);
    }

    render() {
        // const seconds = Math.floor(this.state.elapsedTime / 1000);
        const seconds = (this.state.elapsedTime / 1000).toFixed(1);
        return (
            <div className="stopwatch">
                <h2>Stopwatch</h2>
                <div>{seconds}</div>
                {this.state.running ? (
                    <button onClick={this.onStop.bind(this)}>Stop</button>
                ) : (
                    <button onClick={this.onStart.bind(this)}>Start</button>
                )}
                <button onClick={this.onReset.bind(this)}>Reset</button>
            </div>
        );
    }
}

function Stats(props) {
    const totalPlayers = props.players.length;
    const totalPoints = props.players.reduce(function(total, player) {
        return total + player.score;
    }, 0);
    return (
        <table className="stats">
            <tbody>
                <tr>
                    <td>Players: </td>
                    <td>{totalPlayers}</td>
                </tr>
                <tr>
                    <td>Total points: </td>
                    <td>{totalPoints}</td>
                </tr>
            </tbody>
        </table>
    );
}

Stats.propTypes = {
    players: PropTypes.array.isRequired
};

// Counter is a controlled component that keeps its own state
// to prevent user input from corrupting Application state
// while validating it on change within the component.
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: String(this.props.score),
        }
        // Pattern for string that can be parsed into valid score
        // and passed up to Application.
        this.pattern = /^-?\d{1,3}$/;
    }

    onScoreValidate(input) {
        // Reverts state to props.score if input is invalid.
        if (!this.pattern.test(input)){
            this.setState({
                score: String(this.props.score)
            });
        }
    }

    onScoreModify(input, delta) {
        // Check if score is valid, correct it if needed.
        this.onScoreValidate(input);
        const newScore = parseInt(this.state.score) + delta;
        this.setState({
            score: String(newScore)
        });
        this.props.onChange(newScore);
    }

    onScoreInput(input) {
        if (input === "-" || input === "" || this.pattern.test(input)) {
            // If input is empty or just a "-",
            // the user may be in the process of entering a number.
            // Setting local state allows to wait for further input.
            this.setState({
            score: input
            });
            // If input is already valid, send it up to Application.
            if (this.pattern.test(input)) {
                this.props.onChange(parseInt(input));
            }
        } else {
            // If input is definitely invalid, revert to props.score.
            this.onScoreValidate(input);
        }
    }

    render() {
        return (
            <div className="counter">
                <i
                    className="fa fa-minus-circle fa-2x counter-action decrement"
                    onClick={function(e) {
                        this.onScoreModify(e.target.value, -(this.props.delta));
                    }.bind(this)}
                />
                <div className="counter-score">
                    <input
                        type="text"
                        value={this.state.score}
                        onChange={function(e) {
                            this.onScoreInput(e.target.value.trim());
                        }.bind(this)}
                        onBlur={function(e) {
                            this.onScoreValidate(e.target.value.trim());
                        }.bind(this)}
                        required
                    />
                </div>
                <i
                    className="fa fa-plus-circle fa-2x counter-action increment"
                    onClick={function(e) {
                        this.onScoreModify(e.target.value, this.props.delta);
                    }.bind(this)}
                />
            </div>
        )
    }
}

Counter.propTypes = {
    score: PropTypes.number.isRequired,
    delta: PropTypes.number,
    onChange: PropTypes.func.isRequired,
};

function Player(props) {
    return (
        <div className="player">
            <div className="player-name">
                <a className="remove-player" onClick={props.onRemove}>
                    ✖
                </a>
                {props.name}
                <i
                    className="fa fa-flag"
                    style={{ visibility: props.winner ? "visible" : "hidden" }}
                />
            </div>
            <div className="player-score">
                <Counter
                    score={props.score}
                    onChange={props.onScoreChange}
                    delta={1}
                />
            </div>
        </div>
    );
}

Player.propTypes = {
    name: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    winner: PropTypes.bool.isRequired,
    onScoreChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

// React.createClass is deprecated as of v16.
class Application extends React.Component {
    // React.createClass used to set initial state in getInitialState method.
    // For class, initial state is set in the constructor.
    constructor(props) {
        super(props);
        // Gotta track nextId in state to avoid collisions between new players
        // and those who remain after deletions.
        this.state = {
            players: this.props.initialPlayers,
            winnerScore: 0,
            nextId: this.props.initialPlayers.length + 1
        };
    }

    // Inside of map, the whole function has to be bound to "this".
    render() {
        return (
            <div className="scoreboard">
                <Header title={this.props.title} players={this.state.players} />
                <div className="players">
                    {this.state.players.map(
                        function(player, index) {
                            return (
                                <Player
                                    name={player.name}
                                    score={player.score}
                                    winner={
                                        this.state.winnerScore === player.score
                                    }
                                    key={player.id}
                                    onScoreChange={function(newScore) {
                                        this.onScoreChange(index, newScore);
                                    }.bind(this)}
                                    onRemove={function() {
                                        this.onPlayerRemove(index);
                                    }.bind(this)}
                                />
                            );
                        }.bind(this)
                    )}
                    <AddPlayerForm onAdd={this.onPlayerAdd.bind(this)} />
                </div>
            </div>
        );
    }

    refresh() {
        // Checks for the winner score and calls setState.
        // Reduce with no initial value starts with the 1st player.
        // If there are none, default starting score (0) is winning.
        if (this.state.players.length > 0) {
            this.state.winnerScore = this.state.players.reduce(
                (winner, x) => (x.score > winner.score ? x : winner)
            ).score;
        } else {
            this.state.winnerScore = 0;
        }

        this.setState(this.state);
    }

    onScoreChange(index, newScore) {
        this.state.players[index].score = newScore;
        this.refresh();
    }

    onPlayerAdd(name) {
        this.state.players.push({
            name: name,
            score: 0,
            id: this.state.nextId
        });
        this.state.nextId++;
        this.refresh();
    }

    onPlayerRemove(index) {
        this.state.players.splice(index, 1);
        this.refresh();
    }
}

Application.propTypes = {
    title: PropTypes.string,
    initialPlayers: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            score: PropTypes.number.isRequired,
            id: PropTypes.number.isRequired
        })
    ).isRequired
};

Application.defaultProps = {
    title: "Scoreboard"
};

ReactDOM.render(
    <Application initialPlayers={PLAYERS} />,
    document.getElementById("container")
);
