// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostingImage {

    struct Comment {
        address author;
        string text;
        uint256 timestamp;
    }

    struct Post {
        uint256 id;
        address author;
        string imageUrl;       // URL IPFS atau lokasi upload backend
        string description;    // Deskripsi post
        uint256 likes;         // Jumlah likes / tips
        uint256 timestamp;
        Comment[] comments;    // List komentar
    }

    mapping(uint256 => Post) public posts;
    uint256 public totalPosts = 0;

    event PostCreated(
        uint256 id,
        address indexed author,
        string imageUrl,
        string description,
        uint256 timestamp
    );

    event PostLiked(uint256 id, address indexed liker, uint256 newTotalLikes);

    event CommentAdded(
        uint256 indexed id,
        address indexed commenter,
        string text,
        uint256 timestamp
    );

    // CREATE POST
    function createPost(string memory imageUrl, string memory description) public {
        Post storage newPost = posts[totalPosts];
        newPost.id = totalPosts;
        newPost.author = msg.sender;
        newPost.imageUrl = imageUrl;
        newPost.description = description;
        newPost.timestamp = block.timestamp;

        emit PostCreated(totalPosts, msg.sender, imageUrl, description, block.timestamp);

        totalPosts++;
    }

    // LIKE POST
    function likePost(uint256 postId) public {
        require(postId < totalPosts, "Post tidak ditemukan");

        posts[postId].likes += 1;

        emit PostLiked(postId, msg.sender, posts[postId].likes);
    }

    // ADD COMMENT
    function addComment(uint256 postId, string memory text) public {
        require(postId < totalPosts, "Post tidak ditemukan");

        Comment memory c = Comment({
            author: msg.sender,
            text: text,
            timestamp: block.timestamp
        });

        posts[postId].comments.push(c);

        emit CommentAdded(postId, msg.sender, text, block.timestamp);
    }

    // GET TOTAL COMMENTS
    function getCommentCount(uint256 postId) public view returns (uint256) {
        return posts[postId].comments.length;
    }

    // GET COMMENT BY INDEX
    function getComment(uint256 postId, uint256 index)
        public
        view
        returns (address, string memory, uint256)
    {
        Comment storage c = posts[postId].comments[index];
        return (c.author, c.text, c.timestamp);
    }

    // GET POST DATA
    function getPost(uint256 postId)
        public
        view
        returns (
            uint256 id,
            address author,
            string memory imageUrl,
            string memory description,
            uint256 likes,
            uint256 timestamp,
            uint256 commentCount
        )
    {
        Post storage p = posts[postId];
        return (
            p.id,
            p.author,
            p.imageUrl,
            p.description,
            p.likes,
            p.timestamp,
            p.comments.length
        );
    }
}
