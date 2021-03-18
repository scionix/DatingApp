using API.Data;
using API.DTO;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {

        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _photoService = photoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
        {
            return Ok(await _userRepository.GetMembersAsync());
        }

        //'Name' lets us use the 'CreatedAtRoute' method in 'add-photo' method
        [HttpGet("{username}", Name = "Get User")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            return await _userRepository.GetMemberAsync(username);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            //go get the user
            var user = await _userRepository.GetUserByUsernameAsync(User.Getusername());

            //map the updated values in the memberUpdateDto to the user
            _mapper.Map(memberUpdateDto, user);

            //flag user as being updated
            _userRepository.Update(user);

            //update the user in the DB, return noContent if successful, bad request if not
            if (await _userRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            //get the user add add the photo to cloudinary via the photoservice
            var user = await _userRepository.GetUserByUsernameAsync(User.Getusername());
            var result = await _photoService.AddPhotoAsync(file);

            if (result.Error != null)
                return BadRequest(result.Error.Message);

            //if we don't get an error, configure the photo object with the URI and publicId data from cloudinary response
            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            //if this is the user's first photo, set it to their main photo
            if (user.Photos.Count == 0)
            {
                photo.IsMain = true;
            }
            user.Photos.Add(photo);

            //save the user, return a 201 created code with user route and photoDto
            if (await _userRepository.SaveAllAsync())
            {
                //CreatedAtRoute takes 3 arguments, name of the route, route arguments, and return object type
                return CreatedAtRoute("Get User", new { username = user.UserName }, _mapper.Map<PhotoDto>(photo));
            }

            return BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.Getusername());

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            //if the photo they're trying to set as their main photo is ALREADY their main photo, throw BadRequest
            if (photo.IsMain) return BadRequest("This is already your main photo");

            //turn current main photo off, and new main photo on
            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if (currentMain != null)
                currentMain.IsMain = false;
            photo.IsMain = true;

            if (await _userRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to set main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            //find the user and their photo that matches the given Id
            var user = await _userRepository.GetUserByUsernameAsync(User.Getusername());
            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            //if you can't find it, return not found
            if (photo == null)
                return NotFound();

            //if the photo they're trying to set as their main photo is ALREADY their main photo, throw BadRequest
            if (photo.IsMain) return BadRequest("You can't remove your main photo! Set another main photo");

            //remove the photo from cloudinary with photo service
            if (photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null)
                    return BadRequest(result.Error.Message);
            }

            user.Photos.Remove(photo);
            if (await _userRepository.SaveAllAsync()) return Ok();
            return BadRequest("Failed to delete photo");
        }
    }
}
