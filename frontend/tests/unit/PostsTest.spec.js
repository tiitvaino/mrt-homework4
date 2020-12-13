import {mount, createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Posts from "../../src/components/Posts.vue";

const localVue = createLocalVue();
// const chai = require('chai');

localVue.use(Vuex);
localVue.use(VueRouter);

//Create dummy store
const store = new Vuex.Store({
    state: {
        user: {
            id: 1,
            firstname: 'test',
            lastname: 'test',
            email: 'test',
            avatar: 'test',
        }
    },
    getters: {
        user: (state) => state.user,
    }
});

//Create dummy routes
const routes = [
    {
        path: '/',
        name: 'posts',
    },
    {
        path: '/profiles',
        name: 'profiles'
    }
];

const router = new VueRouter({routes});

const testData = [
    {
        id: 1,
        text: "I think it's going to rain",
        createTime: "2020-12-05 13:53:23",
        likes: 0,
        liked: false,
        media: {
            url: "test-image.jpg",
            type: "image"
        },
        author: {
            id: 2,
            firstname: "Gordon",
            lastname: "Freeman",
            avatar: 'avatar.url'
        }
    },
    {
        id: 2,
        text: "Which weighs more, a pound of feathers or a pound of bricks?",
        createTime: "2020-12-05 13:53:23",
        likes: 1,
        liked: true,
        media: null,
        author: {
            id: 3,
            firstname: "Sarah",
            lastname: "Connor",
            avatar: 'avatar.url'
        }
    },
    {
        id: 4,
        text: null,
        createTime: "2020-12-05 13:53:23",
        likes: 3,
        liked: false,
        media: {
            url: "test-video.mp4",
            type: "video"
        },
        author: {
            id: 5,
            firstname: "Richard",
            lastname: "Stallman",
            avatar: 'avatar.url'
        }
    }
];

//Mock axios.get method that our Component calls in mounted event
jest.mock("axios", () => ({
    get: () => Promise.resolve({
        data: testData
    })
}));

describe('Posts', () => {

    const wrapper = mount(Posts, {router, store, localVue});

    it('1 == 1', function () {
        expect(true).toBe(true)
    });

    it('displays correct amout of posts', function() {
        const items = wrapper.findAll('.post');
        expect(items.length).toEqual(testData.length);
    });

    it('displays correct media type if media exists', function(){
        // Get the names of the media
        var vidname = testData[2].media.url;
        var imgname = testData[0].media.url;

        const items = wrapper.findAll('.post-image');
        var vidok = false;
        var imgok = false;
        var voidok = false;
        var nrOfVid = 0;
        var nrOfImg = 0;
        for (var i = 0; i < items.length; ++i) {
            var item = items.at(i);
            var html_text = item.html()

            // Video
            if (html_text.includes('<video')) {
                nrOfVid += 1;
                if (html_text.includes(vidname))
                    vidok = true;
            }

            // Image
            if (html_text.includes('<img')) {
                nrOfImg += 1;
                if (html_text.includes(imgname))
                    imgok = true;
            }
        };

        // Void
        if (nrOfVid == 1 && nrOfImg == 1)
            voidok = true;

        expect(vidok && imgok && voidok).toBe(true);
    });

    it('displays post create time in correct format', function(){
        const items = wrapper.findAll('div>span>small');
        var ok = true;
        for (var i = 0; i < items.length; ++i) {
            var item = items.at(i);
            if (item.text() !== 'Saturday, December 5, 2020 1:53 PM') {
                ok = false;
                break;
            }
        }

        expect(ok).toBe(true);
    });
});