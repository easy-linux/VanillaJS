import { render, routes, goTo } from '../router';
import { getPosts, getPostById } from '../api/postsApi'
import { getCommentsByPost } from '../api/commentsApi'
import { getPost, setPost } from '../service/posts'
import { setComment, getComment } from '../service/comments'
import { dateFormat } from '../common/utils'


class PostDetail extends HTMLElement {
  constructor() {

    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const title = document.createElement('h2')
    title.setAttribute('class', 'post-main-title');
    title.textContent = 'Post details'
    shadow.appendChild(title)

    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'post-block');

    wrapper.innerHTML = `<div class="post-title"></div>
    <div class="post-text"></div>
    <div class="post-user">
       <div class="post-user-details">
          <user-avatar small="true"></user-avatar>
          <div class="user-name"></div>
       </div>
       <date-formatted></date-formatted>
    </div>`


    const style = document.createElement('style');
    style.textContent = `
      .post-block {
          max-width: 600px;
          border-radius: 10px;
          background-color: #ccc;
          margin: 10px;
          padding:  10px;
          margin: auto;
        }

        .post-main-title{
          text-align: center;
        }
    
        .post-block .post-title{
          padding: 10px;
          font-weight: bold;
        }

        .post-block .post-text{
          padding: 10px;
          font-family: fantasy;
        }

        .post-block .post-user{
          padding: 10px;
          font-family: arial;
          background-color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        user-avatar{
          margin-right: 10px;
        }

        .post-block .post-user .post-user-details{
          display: flex;
          align-items: center;
        }

    `

    shadow.appendChild(style)
    shadow.appendChild(wrapper)

  }

  connectedCallback() {

    const shadow = this.shadowRoot;

    const id = this.getAttribute('post')
    const post = getPost(id)

    const user = shadow.querySelector('.post-user')
    user.addEventListener('click', (e) => {
      e.stopPropagation()
      const post = getPost(id)
      const url = routes.User.reverse({ user: post.user.id })
      goTo(url)
    })

    if (post) {
      this.updatePost(post)
    } else {
      getPostById(id).then((post) => {
        setPost(post)
        this.updatePost(post)
      })
        .catch(error => console.log(error))
    }

  }

  updatePost(post) {
    const shadow = this.shadowRoot;

    const title = shadow.querySelector('.post-title')
    title.textContent = post.title
    const text = shadow.querySelector('.post-text')
    text.textContent = post.text    

    const userAvatar = shadow.querySelector('user-avatar')
    userAvatar.setAttribute('user-name', post.user.user_name)
    const userName = shadow.querySelector('.user-name')
    userName.textContent = post.user.user_fullname

    const postDate = shadow.querySelector('date-formatted')
    postDate.setAttribute('date', post.createdAt)
  }

}

customElements.define('post-detail', PostDetail)

