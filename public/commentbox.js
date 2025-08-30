// @ts-check

/**
 * @typedef NeodugCommentboxComment
 * @property {string} id
 * @property {string} author
 * @property {string} body
 * @property {string} created_at
 */

/**
 * @typedef NeodugCommentboxState
 * @property {NeodugCommentboxComment[]} comments
 * @property {number} pageIndex
 * @property {number} perPage
 * @property {boolean} ascending
 * @property {string} fetchError
 * @property {string} addCommentError
 */

class NeodugCommentbox extends HTMLElement {
    static API_URL = window.location.host.includes('localhost') ? `http://localhost:7654` : `http://localhost:7654`;

    originalHTML = ""
    cbCommentsTemplate = ""

    // STATE
    /** @type {NeodugCommentboxState} */
    state = {
        comments: [],
        pageIndex: 0,
        perPage: 10,
        ascending: false,

        // errors
        fetchError: "",
        addCommentError: ""
    }

    constructor() {
        super()
    }

    // AFTER DOM LOAD
    connectedCallback() {requestAnimationFrame(async () => {
        this.originalHTML = this.innerHTML
        const cbComments = this.qs("cb-comments")
        this.cbCommentsTemplate = cbComments?.innerHTML || ""
        this.state.perPage = Number(this.getAttribute('perpage'))||10
        const ascendingAttr = this.getAttribute('ascending')
        this.state.ascending = ascendingAttr !== null && ascendingAttr !== undefined;
        await this.fetchComments()
        this.render()
    })}

    // ASYNC 
    async fetchComments() {try{
        const url = `${NeodugCommentbox.API_URL}/api/comment`
        const res = await fetch(url)
        if (!res.ok) {
            this.state.fetchError = await NeodugCommentbox.getErrorMessage(res)
            return
        }
        const data = await res.json()
        NeodugCommentbox.log("fetched data:", data)
        if (!data.data || !data.data.length) throw { message: "No comments found" }
        this.state.comments = data.data
    } catch (error) {
        NeodugCommentbox.error(error)
        this.state.fetchError = error?.message || "Something went wrong"
    }}

    async handleAddComment(e) {try{
        e.preventDefault()
        const formData = Object.fromEntries(new FormData(e.currentTarget))
        const url = `${NeodugCommentbox.API_URL}/api/comment`
        const options = { method: "POST", body: JSON.stringify(formData) }
        const res = await fetch(url, options)
        if (!res.ok) {
            this.state.addCommentError = await NeodugCommentbox.getErrorMessage(res)
            return
        }
        const data = await res.json()
        if (!data.data) throw { message: "Something went wrong" }
        this.state.comments.push(data.data)
        this.render()
    } catch (error) {
        NeodugCommentbox.error(error)
        this.state.addCommentError = error?.message || "Something went wrong"
    }}

    // DERIVED
    get displayedComments() {
        const displayed = [...this.state.comments]
        displayed.sort((a, b) => {
            const c1 = this.state.ascending ? a : b
            const c2 = this.state.ascending ? b : a
            return new Date(c1.created_at).getTime() - new Date(c2.created_at).getTime()
        })
        const start = (this.state.perPage) * (this.state.pageIndex)
        const end = (this.state.perPage) * (this.state.pageIndex+1)
        return displayed
            .slice(start, end)
    }

    get page() {
        return (this.state.pageIndex||0) + 1
    }

    get totalPages() {
        const commentCount = this.state.comments.length;
        return Math.ceil(commentCount/this.state.perPage)
    }

    // RENDERERS
    render() {
        // reset innerHTML to template
        this.innerHTML = this.originalHTML

        // must happen before all other rendering
        this.renderComments()

        // Non cb-comments handlebars
        const handlebars = NeodugCommentbox.getHandlebars(this.innerHTML, this.state)
        for (const { handlebar, value } of handlebars) {
            // @ts-ignore
            this.innerHTML = this.innerHTML.replaceAll(handlebar, value)
        }

        // Pagination buttons
        const prevBtns = this.qsa('*[data-cb-previous]')
        const nextBtns = this.qsa('*[data-cb-next]')
        prevBtns.forEach(btn => {
            if (this.page <= 1) btn.remove()
            else btn.addEventListener('click', () => {
                this.state.pageIndex--
                this.render()
            })
        })
        nextBtns.forEach(btn => {
            if (this.page >= this.totalPages) btn.remove()
            else btn.addEventListener('click', () => {
                this.state.pageIndex++
                this.render()
            })
        })

        // form
        const form = this.qs('form[data-cb-form]')
        if (!form) NeodugCommentbox.error(`No form found with data-cb-form attribute.`)
        form?.addEventListener('submit', this.handleAddComment.bind(this))
    }

    renderComments() {
        const parent = this.qs('cb-comments')
        if (!parent) {
            NeodugCommentbox.error("Missing element: <cb-comments>")
            return
        }
        const html = this.cbCommentsTemplate
        parent.innerHTML = ""
        for (const comment of this.displayedComments) {
            let commentHTML = html
            const handlebars = NeodugCommentbox.getHandlebars(commentHTML, comment)
            for (const { handlebar, value } of handlebars) {
                commentHTML = commentHTML.replace(handlebar, value)
            }
            parent.insertAdjacentHTML('beforeend', commentHTML)
        }
    }

    // SELECTORS
    qs(sel) {return this.querySelector(`:scope ${sel}`)}
    qsa(sel) {return this.querySelectorAll(`:scope ${sel}`)}


    ////////// STATIC HELPERS

    /**
     * Safely get an error message from an HTTP response
     * @param {Response} res 
     * @returns {Promise<string>}
     */
    static async getErrorMessage(res) {
        try {
            const data = await res.json()
            if (typeof data == 'string') return data
            return data.message || "Something went wrong"
        } catch (error) {
            NeodugCommentbox.error(error)
            return error?.message || error?.statusText || "Something went wrong"
        }
    }

    /**
     * Log
     * @param {string} label 
     * @param {any} data 
     */
    static log(label, data) {
        console.log(
            `%cNEODUG | ${label}`, 
            `
                background-color: aquamarine;
                color: black;
                font-weight: bold;
                font-size: 14px;
                padding: 3px;
            `, 
            data
        )
    }

    /**
     * Log an error
     * @param {any} error 
     */
    static error(error) {
        console.error(
            "%cNeodugCommentbox error:", 
            `
                background-color: maroon;
                color: white;
                font-weight: bold;
                font-size: 14px;
                padding: 3px;
            `,
            error
        )
    }

    /**
     * Display a date in human-friendly format
     * @param {string} dateStr 
     */
    static displayDate(dateStr) {
        const date = new Date(dateStr)
        const pad0 = n => n < 10 ? "0"+n : n;
        const y = date.getFullYear()
        const m = date.getMonth()+1
        const d = date.getDate()
        const h = pad0(date.getHours())
        const min = pad0(date.getMinutes())
        return `${y}/${m}/${d} @ ${h}:${min}`
    }

    /**
     * 
     * @param {string} str 
     * @param {Record<string, any>} obj
     * @returns {{ handlebar: string, key: string, value: any }[]}
     */
    static getHandlebars(str, obj) {
        const handlebars = [...str.matchAll(/\{\{[^{}]+\}\}/gm)].map(m => m[0])
        return handlebars.map(hb => {
            const key = hb.replace('{{','').replace('}}','').trim()
            let value
            switch (key) {
                case 'date':
                    value = NeodugCommentbox.displayDate(obj.created_at)
                    break
                case 'page':
                    value = (obj.pageIndex||0) + 1
                    break
                case 'totalPages':
                    const commentCount = (obj.comments?.length||0);
                    value = Math.ceil(commentCount/(obj.perPage||0))
                    break
                default:
                    value = obj[key]
                    break
            }
            return { handlebar: hb, key, value }
        })
    }

} // End of class

customElements.define('neodug-commentbox', NeodugCommentbox)

