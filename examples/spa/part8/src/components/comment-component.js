import { render, routes, goTo } from '../router';
import { getPosts } from '../api/postsApi'
import { getComment } from '../service/comments'


class CommentComponent extends HTMLElement {
  constructor() {

    super();

    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'comment-block');

    wrapper.innerHTML = `<div class="comment-text"></div>
    <div class="bottom-block">
        <div class="comment-user">
          <div class="comment-user-details">
              <user-avatar small="true"></user-avatar>
              <div class="user-name"></div>
          </div>
          <date-formatted></date-formatted>
        </div>
    </div>`


    const style = document.createElement('style');
    style.textContent = `
      .comment-block {
          max-width: 300px;
          border-radius: 10px;
          background-color: #fff;
          padding:  10px;
          border: 1px solid #ccc;
          margin: 10px;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
    
        

        .comment-block .comment-text{
          background-color: #eee;
          padding: 10px;
          font-family: fantasy;
          max-height: 200px;
          overflow: hidden;
          cursor: pointer;
        }

        .comment-block .comment-user{
          padding: 10px;
          font-family: arial;
          background-color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .comment-block .comment-user .comment-user-details{
          display: flex;
          align-items: center;
        }
        user-avatar{
          margin-right: 10px;
        }

        .post-button{
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 8px;
          cursor: pointer;
        }
        .post-button:hover{
          background-color: #ccc;
          border: 1px solid #aaa;
          border-radius: 8px;
          color: #fff;
        }

    `

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

  }

  connectedCallback() {

    const shadow = this.shadowRoot;

    const id = this.getAttribute('id')
    const comment = getComment(id)

    const showPostButton = this.getAttribute('post-btn')
    if (showPostButton) {
      const postButton = document.createElement('button')
      postButton.setAttribute('class', 'post-button')
      postButton.textContent = 'Open post'
      postButton.addEventListener('click', (e) => {
        e.stopPropagation()
        const url = routes.Post.reverse({ post: comment.post.id })
        goTo(url)
      }) 
      const bottomBlock = shadow.querySelector('.bottom-block')
      bottomBlock.appendChild(postButton)
    }


    const text = shadow.querySelector('.comment-text')
    text.textContent = comment.text

    const user = shadow.querySelector('.comment-user')

    const userAvatar = shadow.querySelector('user-avatar')
    userAvatar.setAttribute('user-name', comment.user.user_name)
    const userName = shadow.querySelector('.user-name')
    userName.textContent = comment.user.user_fullname

    user.addEventListener('click', (e) => {
      e.stopPropagation()
      const url = routes.User.reverse({ user: comment.user.id })
      goTo(url)
    })

    const commentDate = shadow.querySelector('date-formatted')
    commentDate.setAttribute('date', comment.createdAt)

  }

}

customElements.define('comment-component', CommentComponent)

