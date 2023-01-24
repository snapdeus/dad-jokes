import React, { Component } from 'react'
import './JokeList.css'
import axios from 'axios'
import Joke from './Joke'
import { v4 as uuidv4 } from 'uuid';
import FlipMove from 'react-flip-move';

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }
    constructor (props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        };
        this.handleClick = this.handleClick.bind(this)
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    }
    componentDidMount() {
        if (this.state.jokes.length === 0) {
            this.getJokes()
        }

    }

    handleClick() {
        this.setState({ loading: true }, this.getJokes);

    }

    async getJokes() {
        try {
            let jokes = [];
            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com", { headers: { Accept: 'application/json' } })
                let newJoke = res.data.joke
                if (!this.seenJokes.has(newJoke)) {
                    jokes.push({ id: uuidv4(), text: newJoke, votes: 0, })
                } else {
                    console.log("Found a duplicate!")
                    console.log(newJoke)
                }
            }
            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }),
                () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes)));
        } catch (err) {
            alert(err);
            this.setState({ loading: false })
        }

    }
    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j =>
                j.id === id ? { ...j, votes: j.votes + delta } : j
            )
        }),
            () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <div className='JokeList-spinner'>
                    <i className="far fa-8x fa-laugh fa-spin"></i>
                    <h2 className='JokeList-title'>Loading...</h2>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
        return (
            <div className='JokeList'>
                <div className="JokeList-sidebar">
                    <h1 className='JokeList-title'><span>Dad</span>Jokes</h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
                    <button onClick={this.handleClick} className='JokeList-getmore'>Fetch Jokes</button>
                </div>

                <div className='JokeList-jokes'>
                    <FlipMove duration={500}>
                        {jokes.map(j => (
                            <Joke
                                upvote={() => this.handleVote(j.id, 1)}
                                downvote={() => this.handleVote(j.id, -1)}
                                key={j.id}
                                id={j.id}
                                votes={j.votes}
                                text={j.text} />
                        ))}
                    </FlipMove>
                </div>
            </div>
        )
    }
}

export default JokeList